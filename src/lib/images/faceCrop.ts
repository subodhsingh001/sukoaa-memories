/** Face analysis runs locally in the browser. Model weights download once on first use. */
export interface FaceBox {x:number;y:number;width:number;height:number}
export interface CropPlacement {x:number;y:number;zoom:number;fit:'cover'|'contain'}
let detectorPromise:Promise<import('@mediapipe/tasks-vision').FaceDetector>|undefined;
async function detector(){
 detectorPromise??=(async()=>{
  const {FaceDetector,FilesetResolver}=await import('@mediapipe/tasks-vision');
  const wasm=await FilesetResolver.forVisionTasks('/mediapipe/wasm');
  return FaceDetector.createFromOptions(wasm,{baseOptions:{modelAssetPath:'/mediapipe/models/blaze_face_short_range.tflite',delegate:'CPU'},runningMode:'IMAGE',minDetectionConfidence:0.5});
 })().catch(e=>{detectorPromise=undefined;throw e});
 return detectorPromise;
}
export async function detectFaces(blob:Blob):Promise<{faces:FaceBox[];width:number;height:number}>{
 const bitmap=await createImageBitmap(blob);
 try{
  const canvas=document.createElement('canvas');const scale=Math.min(1,640/Math.max(bitmap.width,bitmap.height));
  canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);
  const model=await detector();const result=model.detect(canvas);
  return {width:bitmap.width,height:bitmap.height,faces:result.detections.flatMap(d=>d.boundingBox?[{x:d.boundingBox.originX/scale,y:d.boundingBox.originY/scale,width:d.boundingBox.width/scale,height:d.boundingBox.height/scale}]:[])};
 }finally{bitmap.close()}
}
/** Fit all detected faces with 8% padding when geometrically possible; otherwise use contain. */
export function safeFacePlacement(faces:FaceBox[],width:number,height:number,frameRatio:number):{placement:CropPlacement;warning?:string}{
 const contain:CropPlacement={x:50,y:50,zoom:1,fit:'contain'};
 if(!faces.length||width<=0||height<=0||frameRatio<=0)return {placement:contain,warning:'No faces detected; kept full photo visible.'};
 const paddingX=width*.08,paddingY=height*.08;
 const minX=Math.max(0,Math.min(...faces.map(f=>f.x))-paddingX),maxX=Math.min(width,Math.max(...faces.map(f=>f.x+f.width))+paddingX);
 const minY=Math.max(0,Math.min(...faces.map(f=>f.y))-paddingY),maxY=Math.min(height,Math.max(...faces.map(f=>f.y+f.height))+paddingY);
 const cropWidth=Math.min(width,height*frameRatio),cropHeight=Math.min(height,width/frameRatio);
 if(maxX-minX>cropWidth||maxY-minY>cropHeight)return {placement:contain,warning:'Faces cannot all fit inside this frame; using contain.'};
 const left=Math.max(0,Math.min(width-cropWidth,(minX+maxX-cropWidth)/2));
 const top=Math.max(0,Math.min(height-cropHeight,(minY+maxY-cropHeight)/2));
 const x=width===cropWidth?50:Math.max(0,Math.min(100,100*left/(width-cropWidth)));
 const y=height===cropHeight?50:Math.max(0,Math.min(100,100*top/(height-cropHeight)));
 return {placement:{x:Math.round(x),y:Math.round(y),zoom:1,fit:'cover'}};
}
