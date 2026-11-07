'use client';
import { Component, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { AlbumPage, PhotoRecord } from '@/lib/db';
import { drawPhoto, pageRects } from './pageLayout';

type Photo=PhotoRecord&{url:string};
type Props={pages:AlbumPage[];photoMap:Map<string,Photo>;pageIndex:number;setPageIndex:(index:number)=>void;cover:string;ink:string;title:string};
const PAPER='#fffaf1';

async function renderPage(page:AlbumPage|undefined,photos:Map<string,Photo>,ink:string):Promise<HTMLCanvasElement>{
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=900;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas 2D unavailable');
 ctx.fillStyle=PAPER;ctx.fillRect(0,0,1200,900);
 ctx.fillStyle='#f6f0e5';ctx.fillRect(30,30,1140,840);
 ctx.fillStyle=PAPER;ctx.fillRect(38,38,1124,824);
 if(!page)return canvas;
 const ids=page.photoIds.filter(id=>photos.has(id));const rects=pageRects(page.layout,ids.length);
 await Promise.all(ids.map(async(id,i)=>{
  const photo=photos.get(id)!;
  try{
   // Decode from the persisted blob, independent of object URL lifecycle.
   const bitmap=await createImageBitmap(photo.blob);
   try{
    const r=rects[i];const frame={x:74+r.x*1052,y:70+r.y*715,w:r.w*1052,h:r.h*715};
    // Image decode is parallel; actual drawing is serialized below to preserve layout.
    return {bitmap,frame,id};
   }catch(error){bitmap.close();throw error}
  }catch{return null}
 })).then(items=>{for(const item of items){if(!item)continue;const {bitmap,frame,id}=item;drawPhoto(ctx,bitmap,bitmap.width,bitmap.height,frame,page.placements[id]);bitmap.close()}});
 ctx.fillStyle=ink.startsWith('#')?ink:'#665344';ctx.textAlign='center';ctx.font='italic 25px Georgia,serif';ctx.fillText(page.caption.slice(0,65),600,850);
 if(ids.length===0){ctx.font='44px Georgia,serif';ctx.fillText('Your story begins here',600,430)}
 return canvas;
}
function usePageTexture(page:AlbumPage|undefined,photos:Map<string,Photo>,ink:string){
 const [texture,setTexture]=useState<THREE.CanvasTexture|null>(null);
 useEffect(()=>{let active=true;setTexture(null);renderPage(page,photos,ink).then(canvas=>{
  if(!active)return;
  const next=new THREE.CanvasTexture(canvas);next.colorSpace=THREE.SRGBColorSpace;next.anisotropy=8;next.needsUpdate=true;setTexture(next);
 }).catch(console.error);return()=>{active=false}},[page,photos,ink]);
 useEffect(()=>()=>{texture?.dispose()},[texture]);return texture;
}
function Paper({page,photos,ink,side}:{page:AlbumPage|undefined;photos:Map<string,Photo>;ink:string;side:'left'|'right'}){
 const texture=usePageTexture(page,photos,ink);const center=side==='left'?-1.53:1.53;
 return <group position={[center,0,0]}>
  <mesh position={[0,-.045,0]} castShadow receiveShadow><boxGeometry args={[3.03,.11,2.32]}/><meshStandardMaterial color="#e8dfd1" roughness={.9}/></mesh>
  {/* The image surface is ABOVE the paper stack. Offset avoids depth fighting. */}
  <mesh position={[0,.028,0]} rotation={[-Math.PI/2,0,0]} receiveShadow>
   <planeGeometry args={[2.98,2.27]}/>
   <meshBasicMaterial color="#ffffff" map={texture||undefined} side={THREE.DoubleSide} toneMapped={false}/>
  </mesh>
  <mesh position={[side==='left'?1.505:-1.505,.031,0]}><boxGeometry args={[.014,.017,2.27]}/><meshStandardMaterial color="#c7b8a5"/></mesh>
 </group>
}
function PhysicalBook({pages,photos,index,cover,ink}:{pages:AlbumPage[];photos:Map<string,Photo>;index:number;cover:string;ink:string}){
 return <>
  <ambientLight intensity={1.4}/><directionalLight position={[1,7,5]} intensity={2.2} castShadow/>
  <group rotation={[0,0,0]}>
   <RoundedBox args={[6.3,.19,2.48]} radius={.045} smoothness={4} position={[0,-.22,0]} castShadow receiveShadow><meshStandardMaterial color={cover} roughness={.77}/></RoundedBox>
   <Paper page={pages[index]} photos={photos} ink={ink} side="left"/>
   <Paper page={pages[index+1]} photos={photos} ink={ink} side="right"/>
   <mesh position={[0,.025,0]} castShadow><boxGeometry args={[.048,.13,2.37]}/><meshStandardMaterial color="#aa9982" roughness={.92}/></mesh>
  </group>
  <ContactShadows position={[0,-.35,0]} opacity={.55} scale={12} blur={2.8} far={4}/>
  <OrbitControls makeDefault enablePan={false} minDistance={4.5} maxDistance={10} minPolarAngle={.15} maxPolarAngle={1.45} target={[0,0,0]}/>
 </>
}
class SceneBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true}}render(){return this.state.failed?this.props.fallback:this.props.children}}
function FlatPreview({pages,photos,index,ink}:{pages:AlbumPage[];photos:Map<string,Photo>;index:number;ink:string}){
 return <div className="album-book-fallback"><div className="album-book-fallback-spread">{[pages[index],pages[index+1]].map((page,side)=>{
  const ids=page?.photoIds.filter(id=>photos.has(id))||[];const rects=pageRects(page?.layout||'hero',ids.length);
  return <div className="album-book-fallback-page" key={page?.id||side}><div className="album-book-fallback-images" style={{position:'relative',display:'block'}}>{ids.map((id,i)=>{const p=photos.get(id)!;const r=rects[i];const placement=page!.placements[id]||{x:50,y:50,zoom:1,fit:'contain'};return <div key={id} style={{position:'absolute',left:`${r.x*100}%`,top:`${r.y*100}%`,width:`${r.w*100}%`,height:`${r.h*100}%`,overflow:'hidden',background:'#e8e0d5'}}><img src={p.url} alt={p.name} style={{width:'100%',height:'100%',objectFit:placement.fit,objectPosition:`${placement.x}% ${placement.y}%`,transform:`scale(${placement.zoom})`}}/></div>})}</div><span style={{color:ink}}>{page?.caption||''}</span></div>
 })}</div></div>
}
export default function BookScene({pages,photoMap,pageIndex,cover,ink}:Props){
 const [supported,setSupported]=useState<boolean|null>(null);const [showFlat,setShowFlat]=useState(false);
 useEffect(()=>{try{const canvas=document.createElement('canvas');setSupported(!!(canvas.getContext('webgl2')||canvas.getContext('webgl')))}catch{setSupported(false)}},[]);
 const flat=useMemo(()=><FlatPreview pages={pages} photos={photoMap} index={pageIndex} ink={ink}/>,[pages,photoMap,pageIndex,ink]);
 return <div className="album-three-scene">
  {supported===false||showFlat?flat:supported===null?<div className="album-3d-loading">Preparing your album…</div>:<SceneBoundary fallback={flat}><Canvas shadows camera={{position:[0,5.3,6.7],fov:42}} dpr={[1,1.6]} gl={{antialias:true,alpha:false}} fallback={flat}><color attach="background" args={['#211d1a']}/><PhysicalBook pages={pages} photos={photoMap} index={pageIndex} cover={cover} ink={ink}/></Canvas></SceneBoundary>}
  <button type="button" className="album-preview-toggle" onClick={()=>setShowFlat(v=>!v)}>{showFlat?'View in 3D':'View flat spread'}</button>
  <div className="album-3d-badge">YOUR PHOTO BOOK · DRAG TO ROTATE · SCROLL TO ZOOM</div>
 </div>
}
