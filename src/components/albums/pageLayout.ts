import type { AlbumPage } from '@/lib/db';

export type Rect = {x:number;y:number;w:number;h:number};
export function pageRects(layout:string,count:number):Rect[] {
  if(count===0)return [];
  if(layout==='fullbleed')return Array.from({length:count},(_,i)=>({x:0,y:0,w:1,h:1}));
  const gap=0.018;
  if(layout==='minimal')return Array.from({length:count},(_,i)=>({x:.035+(i%2)*.49,y:.045+Math.floor(i/2)*.49,w:.455,h:.455}));
  if(layout==='seamless')return Array.from({length:count},(_,i)=>({x:i/count,y:0,w:1/count,h:1}));
  if(layout==='filmstrip')return Array.from({length:count},(_,i)=>({x:i/count+gap/2,y:.04,w:1/count-gap,h:.92}));
  if(layout==='editorial'&&count>1)return [{x:0,y:0,w:.65-gap,h:1},...Array.from({length:count-1},(_,i)=>({x:.65,y:i/(count-1)+gap/2,w:.35-gap,h:1/(count-1)-gap}))];
  if(layout==='mosaic') {const cols=count<=4?2:3,rows=Math.ceil(count/cols);return Array.from({length:count},(_,i)=>({x:(i%cols)/cols+gap/2,y:Math.floor(i/cols)/rows+gap/2,w:1/cols-gap,h:1/rows-gap}));}
  if(layout==='hero'||count===1)return Array.from({length:count},(_,i)=>i===0?{x:0,y:0,w:1,h:1}:{x:.68,y:(i-1)/Math.max(1,count-1),w:.32,h:1/Math.max(1,count-1)});
  if(layout==='pair'&&count===2)return [{x:0,y:0,w:.5-gap/2,h:1},{x:.5+gap/2,y:0,w:.5-gap/2,h:1}];
  if(layout==='triptych'&&count===3)return Array.from({length:3},(_,i)=>({x:i/3+gap/2,y:0,w:1/3-gap,h:1}));
  if(layout==='collage'&&count>=3){const rest=count-1;return [{x:0,y:0,w:.58-gap/2,h:1},...Array.from({length:rest},(_,i)=>({x:.58+gap/2,y:i/rest+gap/2,w:.42-gap,h:1/rest-gap}))]}
  const cols=Math.ceil(Math.sqrt(count)),rows=Math.ceil(count/cols);
  return Array.from({length:count},(_,i)=>({x:(i%cols)/cols+gap/2,y:Math.floor(i/cols)/rows+gap/2,w:1/cols-gap,h:1/rows-gap}));
}
export function drawPhoto(ctx:CanvasRenderingContext2D,img:CanvasImageSource,iw:number,ih:number,rect:Rect,placement:AlbumPage['placements'][string]){
  const {x,y,w,h}=rect;const p=placement||{x:50,y:50,zoom:1,fit:'contain'};
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.fillStyle='#e6dfd4';ctx.fillRect(x,y,w,h);
  const base=(p.fit==='cover'?Math.max(w/iw,h/ih):Math.min(w/iw,h/ih))*(p.zoom||1);
  const dw=iw*base,dh=ih*base;
  ctx.drawImage(img,x+(w-dw)*p.x/100,y+(h-dh)*p.y/100,dw,dh);ctx.restore();
}
