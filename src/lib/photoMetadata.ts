import * as exifr from 'exifr';
export interface LocalPhotoMetadata { takenAt:number; latitude?:number; longitude?:number; }
/** Read only in the browser. Missing capture dates remain unknown (0). */
export async function readPhotoMetadata(blob:Blob):Promise<LocalPhotoMetadata> {
  try {
    const data=await exifr.parse(blob,{pick:['DateTimeOriginal','CreateDate','ModifyDate','GPSLatitude','GPSLongitude','latitude','longitude'],translateValues:true});
    const date=data?.DateTimeOriginal ?? data?.CreateDate;
    const takenAt=date instanceof Date?date.getTime():typeof date==='string'?Date.parse(date):0;
    const latitude=typeof data?.latitude==='number'?data.latitude:undefined;
    const longitude=typeof data?.longitude==='number'?data.longitude:undefined;
    return {takenAt:Number.isFinite(takenAt)&&takenAt>0?takenAt:0,
      ...(latitude!==undefined&&longitude!==undefined&&Math.abs(latitude)<=90&&Math.abs(longitude)<=180?{latitude,longitude}:{})};
  } catch {return {takenAt:0}}
}
