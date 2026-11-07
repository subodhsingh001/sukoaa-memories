import {mkdir,copyFile,stat} from 'node:fs/promises';
import {join} from 'node:path';
const root=process.cwd();
const source=join(root,'node_modules/@mediapipe/tasks-vision/wasm');
const target=join(root,'public/mediapipe/wasm');
await mkdir(target,{recursive:true});
for(const name of ['vision_wasm_internal.wasm','vision_wasm_internal.js','vision_wasm_nosimd_internal.wasm','vision_wasm_nosimd_internal.js']){
  try{await stat(join(source,name));await copyFile(join(source,name),join(target,name));console.log('Copied',name)}
  catch(e){if(e.code==='ENOENT')console.warn('Optional or missing asset:',name);else throw e}
}
console.log('WASM assets copied. Add the licensed MediaPipe BlazeFace model to public/mediapipe/models/blaze_face_short_range.tflite before enabling face detection.');
