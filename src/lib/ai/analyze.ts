export interface LocalAnalysis {id:string; brightness:number; color:string; tone:string; fingerprint:string; label?:string; confidence?:number}
export async function analyzeImage(id:string,blob:Blob):Promise<LocalAnalysis>{
 const bitmap=await createImageBitmap(blob);
 try {
  const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Canvas unavailable');
  ctx.drawImage(bitmap,0,0,32,32);const data=ctx.getImageData(0,0,32,32).data;
  let r=0,g=0,b=0,light=0;const gray:number[]=[];
  for(let i=0;i<data.length;i+=4){const a=data[i],c=data[i+1],d=data[i+2];r+=a;g+=c;b+=d;const l=.299*a+.587*c+.114*d;light+=l;gray.push(l)}
  const n=1024;r/=n;g/=n;b/=n;light/=n;
  // 64-bit difference hash: resized luminance comparisons, useful for near duplicates.
  const small=document.createElement('canvas');small.width=9;small.height=8;const sctx=small.getContext('2d',{willReadFrequently:true});if(!sctx)throw Error('Canvas unavailable');sctx.drawImage(bitmap,0,0,9,8);const pix=sctx.getImageData(0,0,9,8).data;
  const lum=(i:number)=>.299*pix[i]+.587*pix[i+1]+.114*pix[i+2];let bits='';for(let y=0;y<8;y++)for(let x=0;x<8;x++)bits+=lum((y*9+x)*4)>lum((y*9+x+1)*4)?'1':'0';
  const fingerprint=Array.from({length:16},(_,i)=>parseInt(bits.slice(i*4,i*4+4),2).toString(16)).join('');
  const tone=light<75?'Moody':light>190?'Airy':b>r*1.18?'Cool':r>b*1.2?'Warm':'Balanced';
  return {id,brightness:Math.round(light),color:`#${[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')}`,tone,fingerprint};
 } finally {bitmap.close()}
}
export function hamming(a:string,b:string){if(a.length!==b.length)return 64;let count=0;for(let i=0;i<a.length;i++){let x=parseInt(a[i],16)^parseInt(b[i],16);while(x){count+=x&1;x>>=1}}return count}
export function suggestStory(items:{name:string;takenAt:number;note:string;label?:string}[]){const sorted=[...items].sort((a,b)=>(a.takenAt||0)-(b.takenAt||0));if(!sorted.length)return '';const start=new Date(sorted[0].takenAt||Date.now()).toLocaleDateString(undefined,{month:'long',year:'numeric'});const topics=Array.from(new Set(sorted.map(p=>p.label).filter(Boolean))).slice(0,3).join(', ');return `A chapter from ${start}\n\n${sorted.length} moments, each worth keeping. ${topics?`Scenes of ${topics.toLowerCase()} fill these pages. `:''}${sorted.filter(p=>typeof p.note==='string'&&p.note.trim()).slice(0,3).map(p=>p.note.trim()).join(' · ')||'Add a note to each photograph to tell the story in your own words.'}\n\nMade privately on your device.`}
