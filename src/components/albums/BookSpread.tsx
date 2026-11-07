'use client';
import type {AlbumPage,PhotoRecord} from '@/lib/db';
import {pageRects} from './pageLayout';
type Photo=PhotoRecord & {url:string};
function Leaf({page,photoMap,ink,side}:{page?:AlbumPage;photoMap:Map<string,Photo>;ink:string;side:'left'|'right'}){
 const items=(page?.photoIds||[]).map(id=>photoMap.get(id)).filter((p):p is Photo=>!!p);
 return <section className={'sukoaa-book-leaf '+side} style={{color:ink}}><div className="sukoaa-book-photos">{items.map((photo,i)=>{const r=pageRects(page?.layout||'hero',items.length)[i];const p=page?.placements[photo.id]||{x:50,y:50,zoom:1,fit:'contain'};return <div className="sukoaa-book-photo" key={photo.id} style={{left:`${r.x*100}%`,top:`${r.y*100}%`,width:`${r.w*100}%`,height:`${r.h*100}%`}}><img src={photo.url} alt={photo.name} style={{objectFit:p.fit,objectPosition:`${p.x}% ${p.y}%`,transform:`scale(${p.zoom})`}}/></div>})}{!items.length&&<div className="sukoaa-book-placeholder">Your story continues here</div>}</div><div className="sukoaa-book-caption">{page?.caption||'SUKOAA · MEMORIES'}</div></section>
}
export default function BookSpread({pages,photoMap,pageIndex,cover,ink,title,onEdit}:{pages:AlbumPage[];photoMap:Map<string,Photo>;pageIndex:number;cover:string;ink:string;title:string;onEdit:()=>void}){
 const left=pages[pageIndex],right=pages[pageIndex+1];
 return <div className="sukoaa-book-scene"><div className="sukoaa-book-heading"><span>YOUR PHOTO BOOK</span><strong>{title}</strong><button onClick={onEdit}>Edit selected page</button></div><div className="sukoaa-book-outer" style={{background:cover}}><div className="sukoaa-book-spread"><Leaf page={left} photoMap={photoMap} ink={ink} side="left"/><Leaf page={right} photoMap={photoMap} ink={ink} side="right"/></div><div className="sukoaa-book-spine"/></div><p>Pages {pageIndex+1}–{Math.min(pageIndex+2,pages.length)} · Your actual photographs, live from your local library</p></div>
}
