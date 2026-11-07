export type DeskTheme = "walnut" | "felt";

export interface PhotoItem {
  id: string;
  url: string; // Temporary object URL
  name: string;
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
  createdAt: number;
}

export interface StoredPhoto
  extends Omit<PhotoItem, "url"> {
  blob: Blob;
}