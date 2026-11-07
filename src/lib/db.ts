import { openDB, type DBSchema } from 'idb';
export type Theme = 'walnut' | 'felt' | 'midnight';
export type Mode = 'desk' | 'wall' | 'gallery';
export interface PhotoRecord { id:string; blob:Blob; originalBlob?:Blob; name:string; mime:string; size:number; addedAt:number; takenAt:number; latitude?:number; longitude?:number; x:number; y:number; rotation:number; z:number; note:string; favorite:boolean; collectionId:string; }
export interface Collection {id:string; name:string; createdAt:number}
export interface Settings {id:'settings';theme:Theme;mode:Mode}
export interface AlbumRecord {id:string; title:string; templateId:string; createdAt:number; updatedAt:number; size:'square'|'landscape'; pages:AlbumPage[]; coverPhotoId?:string}
export interface AlbumPage {id:string; photoIds:string[]; layout:string; caption:string; placements:Record<string,{x:number;y:number;zoom:number;fit:'contain'|'cover';enhance?:boolean}>}
interface MemoryDB extends DBSchema { albums:{key:string;value:AlbumRecord}; photos:{key:string;value:PhotoRecord};collections:{key:string;value:Collection};settings:{key:string;value:Settings}; }
const database = () => openDB<MemoryDB>('sukoaa-memories',2,{upgrade(db){if(!db.objectStoreNames.contains('photos'))db.createObjectStore('photos',{keyPath:'id'});if(!db.objectStoreNames.contains('collections'))db.createObjectStore('collections',{keyPath:'id'});if(!db.objectStoreNames.contains('albums'))db.createObjectStore('albums',{keyPath:'id'});if(!db.objectStoreNames.contains('settings'))db.createObjectStore('settings',{keyPath:'id'});}});
export async function readAll(){const db=await database();const tx=db.transaction(['photos','collections','settings'],'readonly');const [photos,collections,settings]=await Promise.all([tx.objectStore('photos').getAll(),tx.objectStore('collections').getAll(),tx.objectStore('settings').get('settings')]);await tx.done;return {photos,collections,settings};}
export async function putPhoto(p:PhotoRecord){const db=await database();await db.put('photos',p)}
export async function putPhotos(ps:PhotoRecord[]){const db=await database();const tx=db.transaction('photos','readwrite');for(const p of ps)await tx.store.put(p);await tx.done}
export async function deletePhoto(id:string){const db=await database();await db.delete('photos',id)}
export async function putCollection(c:Collection){const db=await database();await db.put('collections',c)}
export async function deleteCollection(id:string){const db=await database();await db.delete('collections',id)}
export async function putSettings(s:Settings){const db=await database();await db.put('settings',s)}
export async function resetAll(){const db=await database();const tx=db.transaction(['photos','collections','settings','albums'],'readwrite');await Promise.all([tx.objectStore('photos').clear(),tx.objectStore('collections').clear(),tx.objectStore('settings').clear(),tx.objectStore('albums').clear()]);await tx.done}
export async function replaceAll(photos:PhotoRecord[],collections:Collection[],settings:Settings){const db=await database();const tx=db.transaction(['photos','collections','settings'],'readwrite');await Promise.all([tx.objectStore('photos').clear(),tx.objectStore('collections').clear(),tx.objectStore('settings').clear()]);for(const p of photos)await tx.objectStore('photos').put(p);for(const c of collections)await tx.objectStore('collections').put(c);await tx.objectStore('settings').put(settings);await tx.done}

export async function getAlbums(){return (await database()).getAll('albums')}
export async function saveAlbum(a:AlbumRecord){return (await database()).put('albums',a)}
export async function removeAlbum(id:string){return (await database()).delete('albums',id)}

/** Compatibility API for the original Memory Desk components.
 * These methods share the same IndexedDB database and photos store as Album Studio.
 */
export async function getPhotos(): Promise<PhotoRecord[]> {
  const db = await database();
  return db.getAll('photos');
}

export async function getPhoto(id: string): Promise<PhotoRecord | undefined> {
  const db = await database();
  return db.get('photos', id);
}

export async function savePhoto(photo: PhotoRecord): Promise<void> {
  await putPhoto(photo);
}

export async function updateStoredPhoto(
  id: string,
  changes: Partial<Omit<PhotoRecord, 'id' | 'blob'>> & { zIndex?: number },
): Promise<void> {
  const db = await database();
  const tx = db.transaction('photos', 'readwrite');
  const previous = await tx.store.get(id);
  if (!previous) {
    await tx.done;
    throw new Error(`Photo not found: ${id}`);
  }
  const { zIndex, ...rest } = changes;
  await tx.store.put({
    ...previous,
    ...rest,
    ...(zIndex === undefined ? {} : { z: zIndex }),
  });
  await tx.done;
}

export async function clearStoredPhotos(): Promise<void> {
  const db = await database();
  await db.clear('photos');
}
