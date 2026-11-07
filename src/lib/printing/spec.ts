import type {AlbumRecord,PhotoRecord} from '@/lib/db';
import {pageRects} from '@/components/albums/pageLayout';
export interface PrintSpec {id:string;label:string;trimWidthMm:number;trimHeightMm:number;bleedMm:number;safeMm:number;minPages:number;maxPages:number;requiredDpi:number;binding:'layflat'|'casebound'|'perfect';}
export interface PreflightIssue {severity:'error'|'warning';code:string;message:string;page?:number;photoId?:string;}
// These are SUKOAA proofing presets, NOT printer-certified specifications.
export const proofPresets:PrintSpec[]=[
 {id:'square-8',label:'Square 8 × 8 in (proof)',trimWidthMm:203.2,trimHeightMm:203.2,bleedMm:3,safeMm:8,minPages:1,maxPages:120,requiredDpi:300,binding:'layflat'},
 {id:'landscape-11',label:'Landscape 11 × 8.5 in (proof)',trimWidthMm:279.4,trimHeightMm:215.9,bleedMm:3,safeMm:8,minPages:1,maxPages:120,requiredDpi:300,binding:'layflat'},
];
export function preflight(album:AlbumRecord,photos:Map<string,PhotoRecord>,spec:PrintSpec,dimensions:Map<string,{width:number;height:number}>):PreflightIssue[]{
 const issues:PreflightIssue[]=[];
 if(album.pages.length<spec.minPages||album.pages.length>spec.maxPages)issues.push({severity:'error',code:'PAGE_COUNT',message:`Page count must be ${spec.minPages}–${spec.maxPages}.`});
 album.pages.forEach((page,index)=>{
  if(!page.photoIds.length)issues.push({severity:'warning',code:'EMPTY_PAGE',message:'This page has no photographs.',page:index+1});
  const rects=pageRects(page.layout,page.photoIds.length);
  page.photoIds.forEach((id,j)=>{
   const photo=photos.get(id);if(!photo){issues.push({severity:'error',code:'MISSING_PHOTO',message:'This album references a photo that is not in the current browser library. Re-import the original or remove the broken reference.',page:index+1,photoId:id});return;}
   const dim=dimensions.get(id);if(!dim){issues.push({severity:'warning',code:'UNCHECKED_RESOLUTION',message:'Image resolution has not been inspected.',page:index+1,photoId:id});return;}
   const rect=rects[j];if(!rect)return;
   const placement=page.placements[id];const zoom=placement?.zoom||1;
   const wIn=(rect.w*spec.trimWidthMm)/25.4,hIn=(rect.h*(spec.trimHeightMm-18))/25.4;
   const fit=placement?.fit||'contain';const frameRatio=wIn/Math.max(hIn,.001);const imageRatio=dim.width/Math.max(dim.height,1);
   const coverFactor=fit==='cover'?Math.max(frameRatio/imageRatio,imageRatio/frameRatio):1;
   const effective=Math.min(dim.width/wIn,dim.height/hIn)/(zoom*coverFactor);
   if(effective<spec.requiredDpi)issues.push({severity:'warning',code:'LOW_DPI',message:`Effective resolution ~${Math.floor(effective)} DPI (target ${spec.requiredDpi}). Use a higher-resolution original, a smaller frame, or less zoom. Sharpening cannot add real pixels.`,page:index+1,photoId:id});
  });
 });
 issues.push({severity:'warning',code:'PROVIDER_PROOF',message:'Proof PDF is not certified for production. Cover, spine, bleed and provider-specific requirements must be validated before ordering.'});
 return issues;
}
