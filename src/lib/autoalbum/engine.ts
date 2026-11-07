import type { AlbumPage, PhotoRecord } from '@/lib/db';

export type PhotoCandidate = Pick<PhotoRecord, 'id' | 'name' | 'takenAt' | 'addedAt' | 'size'> & {
  width?: number; height?: number; latitude?: number; longitude?: number;
  blurScore?: number; perceptualHash?: string; faces?: Array<{x:number;y:number;width:number;height:number}>;
};
export interface AutoAlbumOptions { maxPages: number; photosPerPage?: number; eventGapHours?: number; allowDuplicates?: boolean; }
export interface AutoAlbumResult { pages: AlbumPage[]; unusedPhotoIds: string[]; warnings: string[]; events: number; }
const when = (p:PhotoCandidate) => Number.isFinite(p.takenAt) && p.takenAt > 0 ? p.takenAt : (p.addedAt || 0);
const validGPS = (p:PhotoCandidate) => typeof p.latitude==='number' && typeof p.longitude==='number' && Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && Math.abs(p.latitude)<=90 && Math.abs(p.longitude)<=180;
function distanceKm(a:PhotoCandidate,b:PhotoCandidate) {
  if(!validGPS(a)||!validGPS(b))return 0;
  const rad=Math.PI/180,lat1=a.latitude!*rad,lat2=b.latitude!*rad;
  const dlat=(b.latitude!-a.latitude!)*rad,dlon=(b.longitude!-a.longitude!)*rad;
  const h=Math.sin(dlat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dlon/2)**2;
  return 12742*Math.asin(Math.min(1,Math.sqrt(h)));
}
export function clusterEvents(items:PhotoCandidate[],gapHours=12):PhotoCandidate[][] {
  const sorted=[...items].sort((a,b)=>when(a)-when(b)||a.id.localeCompare(b.id));
  const groups:PhotoCandidate[][]=[];
  for(const photo of sorted){const group=groups[groups.length-1];const previous=group?.[group.length-1];
    if(!previous||Math.abs(when(photo)-when(previous))>gapHours*3600000||(validGPS(photo)&&validGPS(previous)&&distanceKm(photo,previous)>50))groups.push([photo]);
    else group.push(photo);
  }
  return groups;
}
export function hammingHash(a:string,b:string):number {
  if(a.length!==b.length)return Infinity;
  let n=0;for(let i=0;i<a.length;i++){const x=parseInt(a[i],16)^parseInt(b[i],16);if(!Number.isFinite(x))return Infinity;n+=(x.toString(2).match(/1/g)||[]).length;}return n;
}
export function qualityScore(p:PhotoCandidate):number {
  const resolution=Math.min(1,((p.width||0)*(p.height||0))/(2400*1600));
  const sharpness=p.blurScore===undefined?0.5:Math.min(1,Math.log1p(Math.max(0,p.blurScore))/Math.log1p(1800));
  return resolution*0.45+sharpness*0.55;
}
function chooseLayout(batch:PhotoCandidate[]):string {
  if(batch.length===1)return 'hero';
  if(batch.length===2)return 'pair';
  if(batch.length===3)return 'editorial';
  return 'mosaic';
}
export function generateAutoAlbum(items:PhotoCandidate[],options:AutoAlbumOptions):AutoAlbumResult {
  const maxPages=Math.max(1,Math.min(200,Math.floor(options.maxPages)||1));
  const capacity=Math.max(1,Math.min(8,Math.floor(options.photosPerPage||4)));
  const events=clusterEvents(items,options.eventGapHours||12);
  const selected:PhotoCandidate[]=[];const unused:string[]=[];
  for(const event of events){const kept:PhotoCandidate[]=[];
    for(const photo of [...event].sort((a,b)=>qualityScore(b)-qualityScore(a)||when(a)-when(b))){
      const near=kept.some(p=>p.perceptualHash&&photo.perceptualHash&&hammingHash(p.perceptualHash,photo.perceptualHash)<=6);
      if(near&&!options.allowDuplicates)unused.push(photo.id);else kept.push(photo);
    }
    selected.push(...kept.sort((a,b)=>when(a)-when(b)));
  }
  // Balance coverage: never silently drop photos. Excess remains available in the tray.
  const pageCapacity=maxPages*capacity;
  const arranged=selected.slice(0,pageCapacity);unused.push(...selected.slice(pageCapacity).map(p=>p.id));
  const pageCount=Math.min(maxPages,Math.ceil(arranged.length/capacity));
  const pages:AlbumPage[]=[];
  for(let i=0;i<pageCount;i++){
    const batch=arranged.slice(i*capacity,(i+1)*capacity);
    const date=when(batch[0]);
    pages.push({id:crypto.randomUUID(),photoIds:batch.map(p=>p.id),layout:chooseLayout(batch),caption:date?new Date(date).toLocaleDateString(undefined,{month:'long',year:'numeric'}):`Chapter ${i+1}`,
      placements:Object.fromEntries(batch.map(p=>[p.id,{x:50,y:50,zoom:1,fit:'contain' as const}]))});
  }
  const warnings:string[]=[];
  if(unused.length)warnings.push(`${unused.length} photograph(s) were not placed; they remain in your library.`);
  if(items.some(p=>!p.takenAt))warnings.push('Some photographs have no capture date; import time was used.');
  return {pages:pages.length?pages:[{id:crypto.randomUUID(),photoIds:[],layout:'hero',caption:'Your story begins here',placements:{}}],unusedPhotoIds:unused,warnings,events:events.length};
}
/** Quality uses a 384px working image; duplicate detection uses a separate 9x8 dHash. */
export async function inspectPhoto(blob:Blob):Promise<Pick<PhotoCandidate,'width'|'height'|'blurScore'|'perceptualHash'>> {
  const bitmap=await createImageBitmap(blob);
  try {
    const side=384, scale=Math.min(1,side/Math.max(bitmap.width,bitmap.height));
    const width=Math.max(3,Math.round(bitmap.width*scale)),height=Math.max(3,Math.round(bitmap.height*scale));
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Canvas unavailable');
    ctx.drawImage(bitmap,0,0,width,height);
    const rgba=ctx.getImageData(0,0,width,height).data;
    const grey=new Float32Array(width*height);
    for(let i=0;i<grey.length;i++)grey[i]=rgba[i*4]*.299+rgba[i*4+1]*.587+rgba[i*4+2]*.114;
    let sum=0,sumSq=0,n=0;
    for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
      const i=y*width+x,lap=4*grey[i]-grey[i-1]-grey[i+1]-grey[i-width]-grey[i+width];
      sum+=lap;sumSq+=lap*lap;n++;
    }
    // Use the same dHash algorithm as analyzeImage; hashes from older aHash builds
    // must be recomputed rather than compared across algorithms.
    const small=document.createElement('canvas');small.width=9;small.height=8;
    const sctx=small.getContext('2d',{willReadFrequently:true});if(!sctx)throw Error('Canvas unavailable');
    sctx.drawImage(bitmap,0,0,9,8);const pix=sctx.getImageData(0,0,9,8).data;
    const lum=(i:number)=>.299*pix[i]+.587*pix[i+1]+.114*pix[i+2];let bits='';
    for(let y=0;y<8;y++)for(let x=0;x<8;x++)bits+=lum((y*9+x)*4)>lum((y*9+x+1)*4)?'1':'0';
    const perceptualHash=Array.from({length:16},(_,i)=>parseInt(bits.slice(i*4,i*4+4),2).toString(16)).join('');
    return {width:bitmap.width,height:bitmap.height,blurScore:n?Math.max(0,sumSq/n-(sum/n)**2):0,perceptualHash};
  } finally {bitmap.close()}
}
