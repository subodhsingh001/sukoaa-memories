import { create } from "zustand";
import type { PhotoItem, DeskTheme } from "@/types/photo";

interface MemoryState {
  photos: PhotoItem[];
  highestZ: number;
  hydrated: boolean;
  theme: DeskTheme;

  setPhotos: (photos: PhotoItem[]) => void;
  addPhotos: (photos: PhotoItem[]) => void;
  bringToFront: (id: string) => number;
  updatePosition: (
    id: string,
    x: number,
    y: number
  ) => void;
  tidyStack: () => void;
  clearDesk: () => void;
  setTheme: (theme: DeskTheme) => void;
}

export const useMemoryStore = create<MemoryState>(
  (set, get) => ({
    photos: [],
    highestZ: 1,
    hydrated: false,
    theme: "walnut",

    setPhotos: (photos) =>
      set({
        photos,
        hydrated: true,
        highestZ: Math.max(
          1,
          ...photos.map((p) => p.zIndex)
        ),
      }),

    addPhotos: (photos) =>
      set((state) => ({
        photos: [...state.photos, ...photos],
        highestZ: Math.max(
          state.highestZ,
          ...photos.map((p) => p.zIndex)
        ),
      })),

    bringToFront: (id) => {
      const nextZ = get().highestZ + 1;

      set((state) => ({
        highestZ: nextZ,
        photos: state.photos.map((p) =>
          p.id === id ? { ...p, zIndex: nextZ } : p
        ),
      }));

      return nextZ;
    },

    updatePosition: (id, x, y) =>
      set((state) => ({
        photos: state.photos.map((p) =>
          p.id === id ? { ...p, x, y } : p
        ),
      })),

    tidyStack: () =>
      set((state) => ({
        photos: [...state.photos]
          .sort((a, b) => a.createdAt - b.createdAt)
          .map((p, index) => ({
            ...p,
            x: index * 3,
            y: index * 3,
            rotation: (index % 5 - 2) * 2,
            zIndex: index + 1,
          })),
        highestZ: Math.max(1, state.photos.length),
      })),

    clearDesk: () =>
      set({
        photos: [],
        highestZ: 1,
      }),

    setTheme: (theme) => set({ theme }),
  })
);