const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname,'../src/lib/autoalbum/engine.ts'),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const moduleExports={};
vm.runInNewContext(compiled,{exports:moduleExports,require:()=>({}),crypto:require('node:crypto').webcrypto,console});
const {generateAutoAlbum,clusterEvents,hammingHash,qualityScore}=moduleExports;
const make=(n)=>Array.from({length:n},(_,i)=>({id:String(i),name:'photo '+i,takenAt:Date.UTC(2025,0,1)+i*60000,addedAt:0,size:1000,width:2000,height:1500,blurScore:150}));
test('8 unique photos fit 4 interior pages without repetition',()=>{
 const result=generateAutoAlbum(make(8),{maxPages:4,photosPerPage:2});
 assert.equal(result.pages.length,4);assert.equal(new Set(result.pages.flatMap(p=>p.photoIds)).size,8);assert.equal(result.unusedPhotoIds.length,0);
});
test('excess photos stay in unused tray with warning',()=>{
 const result=generateAutoAlbum(make(10),{maxPages:4,photosPerPage:2});
 assert.equal(result.pages.flatMap(p=>p.photoIds).length,8);assert.equal(result.unusedPhotoIds.length,2);assert.ok(result.warnings.length);
});
test('time and GPS separate events',()=>{
 const ps=make(3);ps[0].latitude=22.6;ps[0].longitude=88.4;ps[1].latitude=28.6;ps[1].longitude=77.2;
 assert.equal(clusterEvents(ps).length,2);
});
test('hash distance and sharpness ranking',()=>{
 assert.equal(hammingHash('0000000000000000','0000000000000000'),0);
 assert.equal(hammingHash('0000000000000000','ffffffffffffffff'),64);
 assert.ok(qualityScore({...make(1)[0],blurScore:1000})>qualityScore({...make(1)[0],blurScore:2}));
});
