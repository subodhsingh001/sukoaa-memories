/** Decode iPhone HEIC/HEIF on browsers without native support. Originals remain untouched. */
export async function isHeic(file:Blob,name=''):Promise<boolean>{
 if(/image\/(hei[cf]|heic-sequence|heif-sequence)/i.test(file.type)||/\.hei[cf]$/i.test(name))return true;
 const bytes=new Uint8Array(await file.slice(0,32).arrayBuffer());
 const signature=String.fromCharCode(...bytes.slice(4,12));
 return signature.startsWith('ftyp') && /^(heic|heix|hevc|hevx|mif1|msf1)$/i.test(signature.slice(4));
}
export async function normalizePhoto(file:File):Promise<{blob:Blob;converted:boolean;warning?:string}>{
 if(!await isHeic(file,file.name))return {blob:file,converted:false};
 try{
  const bitmap=await createImageBitmap(file);bitmap.close();
  return {blob:file,converted:false};
 }catch{}
 try{
  const {heicTo}=await import('heic-to');
  const output=await heicTo({blob:file,type:'image/jpeg',quality:0.95});
  const blob=Array.isArray(output)?output[0]:output;
  if(!blob || !blob.size)throw new Error('Decoder returned an empty image');
  const bitmap=await createImageBitmap(blob);bitmap.close();
  return {blob,converted:true};
 }catch(e){throw new Error(`Cannot decode HEIC ${file.name}: ${String(e)}`)}
}
