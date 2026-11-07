from pathlib import Path
p=Path('src/components/albums/AlbumStudio.tsx');s=p.read_text()
a=s.index('function createPages(');b=s.index('export default function AlbumStudio',a)
s=s[:a]+'''function createPages(photos:Photo[],_templateId:string):AlbumPage[]{
 const sorted=[...photos].sort((a,b)=>(a.takenAt||a.addedAt)-(b.takenAt||b.addedAt));
 // A cover is rendered separately. Interior pages hold 2-4 unique photographs.
 const pages:AlbumPage[]=[];
 const pageCount=Math.ceil(sorted.length/2);
 for(let i=0;i<pageCount;i++){
  const batch=sorted.slice(i*2,i*2+2);
  const portraitCount=batch.filter(p=>{const name=p.name.toLowerCase();return name.includes('portrait')}).length;
  const layout=batch.length===1?'hero':i%3===0?'pair':i%3===1?'editorial':'seamless';
  pages.push({id:crypto.randomUUID(),photoIds:batch.map(p=>p.id),layout,caption:batch.length?new Date(batch[0].takenAt||batch[0].addedAt).toLocaleDateString(undefined,{month:'long',year:'numeric'}):'',placements:Object.fromEntries(batch.map(p=>[p.id,{x:50,y:50,zoom:1,fit:'cover' as const}]))});
 }
 return pages.length?pages:[{id:crypto.randomUUID(),photoIds:[],layout:'hero',caption:'Your story begins here',placements:{}}];
}
''' + s[b:]
s=s.replace(" const addPage=()=>",''' const deletePage=()=>{if(!album||album.pages.length<=1){setNotice('Keep at least one page.');return;}if(!window.confirm('Remove this page from the album? Photos stay in your library.'))return;update(a=>({...a,pages:a.pages.filter((_,i)=>i!==pageIndex)}));setPageIndex(i=>Math.max(0,Math.min(i,album.pages.length-2)));setSelectedPhoto(null)};
 const movePage=(direction:-1|1)=>{if(!album)return;const target=pageIndex+direction;if(target<0||target>=album.pages.length)return;update(a=>{const pages=[...a.pages];[pages[pageIndex],pages[target]]=[pages[target],pages[pageIndex]];return {...a,pages}});setPageIndex(target)};
 const movePhoto=(id:string,direction:-1|1)=>update(a=>({...a,pages:a.pages.map((p,i)=>{if(i!==pageIndex)return p;const photoIds=[...p.photoIds];const from=photoIds.indexOf(id),to=from+direction;if(from<0||to<0||to>=photoIds.length)return p;[photoIds[from],photoIds[to]]=[photoIds[to],photoIds[from]];return {...p,photoIds}})}));
 const addPage=()=>''')
s=s.replace('<button className="album-side-action" onClick={addPage}>+ Add page</button>', '''<div className="album-page-actions"><button onClick={()=>movePage(-1)} disabled={pageIndex===0} title="Move page earlier">↑ Move up</button><button onClick={()=>movePage(1)} disabled={pageIndex===album.pages.length-1} title="Move page later">↓ Move down</button></div><button className="album-side-action" onClick={deletePage}><Trash2 size={15}/> Delete selected page</button><button className="album-side-action" onClick={addPage}>+ Add page</button>''')
s=s.replace("{photos.filter(p=>!page.photoIds.includes(p.id)).map(p=>", "{photos.filter(p=>!album.pages.some(pg=>pg.photoIds.includes(p.id))).map(p=>")
s=s.replace("{currentPhotos.map(p=><button key={p.id}","{currentPhotos.map(p=><button key={p.id}")
s=s.replace('<button onClick={()=>removeFromPage(focus.id)}>Remove from page</button>', '''<div className="album-page-actions"><button onClick={()=>movePhoto(focus.id,-1)}>← Earlier</button><button onClick={()=>movePhoto(focus.id,1)}>Later →</button></div><button onClick={()=>removeFromPage(focus.id)}>Remove from page (keep original)</button>''')
s=s.replace('const portraitCount=batch.filter(p=>{const name=p.name.toLowerCase();return name.includes(\'portrait\')}).length;\n  ','')
s=s.replace('12 curated album styles, beautiful layouts and editable photo placements.', '12 curated album styles, compact photo layouts and editable photo placements.')
s=s.replace('Automatic arrangement uses dates and photo count; no cloud upload','2 unique photos per interior page by default; no cloud upload')
p.write_text(s)
q=Path('src/components/albums/pageLayout.ts');t=q.read_text();t=t.replace("if(layout==='minimal')return Array.from({length:count},(_,i)=>({x:.1+(i%2)*.4,y:.18+Math.floor(i/2)*.35,w:.36,h:.29}));", "if(layout==='minimal')return Array.from({length:count},(_,i)=>({x:.035+(i%2)*.49,y:.045+Math.floor(i/2)*.49,w:.455,h:.455}));")
t=t.replace("if(layout==='filmstrip')return Array.from({length:count},(_,i)=>({x:i/count+gap/2,y:.23,w:1/count-gap,h:.54}));", "if(layout==='filmstrip')return Array.from({length:count},(_,i)=>({x:i/count+gap/2,y:.04,w:1/count-gap,h:.92}));")
q.write_text(t)
c=Path('src/components/albums/album.css');c.write_text(c.read_text()+'''\n/* Album Studio: tighter editorial pages and explicit page controls */\n.album-flat-page{padding:2.5%;gap:6px}.album-flat-caption{font-size:13px;min-height:18px}.album-image-slot{box-shadow:none}.album-page-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px}.album-page-actions button{border:1px solid #4b515a;border-radius:7px;background:#303641;color:#f4e9d9;padding:8px 5px;font-size:11px}.album-page-actions button:disabled{opacity:.35}.album-crop-controls>button{border:1px solid #6a5550;padding:9px;border-radius:7px;color:#f0b6a8}\n''')
Path('ALBUM_STUDIO_CHANGES.md').write_text('''# Album Studio changes (based on user-edited src.zip)\n\n- Default album generation uses each photo once, two photos per interior page. Eight photos => four interior pages. Covers are separate visual assets.\n- Add photo selector excludes images already used elsewhere in the album, preventing accidental repeats.\n- Delete selected page and move selected page up/down.\n- Reorder selected photos within a page and remove a photo without deleting its original.\n- Tightened page margins and made filmstrip/minimal layouts use more page area.\n- Preserved all other source files from the uploaded archive.\n\nThis is a source-only archive, matching the user's upload. Copy src/ into your existing project, and retain your existing package.json, node_modules, and other project files. Back up IndexedDB albums first. No runtime build verification was possible in this environment.\n''')
