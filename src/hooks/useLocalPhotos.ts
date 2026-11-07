"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMemoryStore } from "@/stores/useMemoryStore";
import {
  getPhotos,
  savePhoto,
  updateStoredPhoto,
  clearStoredPhotos,
} from "@/lib/db";
import type { PhotoItem } from "@/types/photo";
import type { PhotoRecord } from "@/lib/db";
import { readPhotoMetadata } from "@/lib/photoMetadata";
import { normalizePhoto } from "@/lib/images/decode";

export function useLocalPhotos() {
  const busy = useRef(false);
  const urls = useRef(new Set<string>());

  const addPhotos = useMemoryStore((s) => s.addPhotos);
  const setPhotos = useMemoryStore((s) => s.setPhotos);

  useEffect(() => {

    let cancelled = false;

    async function hydrate() {
      try {
        const saved = await getPhotos();

        if (cancelled) return;

        const photos: PhotoItem[] = saved.map(
          ({ blob, ...metadata }) => {
            const url = URL.createObjectURL(blob);
            urls.current.add(url);

            return { id:metadata.id, name:metadata.name, x:metadata.x, y:metadata.y, rotation:metadata.rotation, zIndex:metadata.z, createdAt:metadata.addedAt, url };
          }
        );

        setPhotos(photos);
      } catch (error) {
        console.error("Photo loading failed:", error);
        // Do not replace the visible library when storage temporarily fails.
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
      // Blob URLs remain valid while photos are mounted.
    };
  }, [setPhotos]);

  const importPhotos = useCallback(
    async (files: File[]) => {
      if (busy.current) return;
      busy.current = true;

      try {
        const images = files.filter(
          (file) => file.type.startsWith("image/") || /\.hei[cf]$/i.test(file.name)
        );

        for (const file of images) {
          const state = useMemoryStore.getState();

          const metadata = await readPhotoMetadata(file);
          const normalized = await normalizePhoto(file);
          const photo: PhotoRecord = {
            ...metadata,
            mime:normalized.blob.type || file.type, size:normalized.blob.size, addedAt:Date.now(),
            note:"", favorite:false, collectionId:"",
            id: crypto.randomUUID(),
            blob: normalized.blob,
            name: file.name,
            x: Math.random() * 400 - 200,
            y: Math.random() * 220 - 110,
            rotation: Math.random() * 30 - 15,
            z: state.highestZ + 1,
          };

          await savePhoto(photo);

          const { blob } = photo;
          const url = URL.createObjectURL(blob);

          urls.current.add(url);
          addPhotos([{ id:photo.id, name:photo.name, x:photo.x, y:photo.y, rotation:photo.rotation, zIndex:photo.z, createdAt:photo.addedAt, url }]);
        }
      } catch (error) {
        console.error("Import failed:", error);
        alert("Some photos could not be saved.");
      } finally {
        busy.current = false;
      }
    },
    [addPhotos]
  );

  const tidy = useCallback(async () => {
    useMemoryStore.getState().tidyStack();

    const photos = useMemoryStore.getState().photos;

    await Promise.all(
      photos.map((p) =>
        updateStoredPhoto(p.id, {
          x: p.x,
          y: p.y,
          rotation: p.rotation,
          zIndex: p.zIndex,
        })
      )
    );
  }, []);

  const clear = useCallback(async () => {
    if (!window.confirm("Delete all imported photos from this browser?")) {
      return;
    }

    try {
      await clearStoredPhotos();

      const photos = useMemoryStore.getState().photos;
      photos.forEach((p) => {
        URL.revokeObjectURL(p.url);
        urls.current.delete(p.url);
      });

      useMemoryStore.getState().clearDesk();
    } catch (error) {
      console.error("Clear failed:", error);
      alert("Unable to clear local photos.");
    }
  }, []);

  // Re-read metadata from the original stored bytes. Converted HEIC derivatives may
  // not retain EXIF; in that case the original must be re-imported to recover it.
  const rescanLibrary = useCallback(async () => {
    const saved = await getPhotos();
    let updated = 0, unavailable = 0;
    for (const photo of saved) {
      if (photo.takenAt > 0 && Number.isFinite(photo.takenAt) &&
          Number.isFinite(photo.latitude) && Number.isFinite(photo.longitude)) continue;
      const meta = await readPhotoMetadata(photo.blob);
      const changes: Partial<PhotoRecord> = {};
      if ((!photo.takenAt || !Number.isFinite(photo.takenAt)) && meta.takenAt) changes.takenAt = meta.takenAt;
      if (photo.latitude === undefined && meta.latitude !== undefined) changes.latitude = meta.latitude;
      if (photo.longitude === undefined && meta.longitude !== undefined) changes.longitude = meta.longitude;
      if (Object.keys(changes).length) { await updateStoredPhoto(photo.id, changes); updated++; }
      else unavailable++;
    }
    return { scanned: saved.length, updated, unavailable };
  }, []);

  return { importPhotos, tidy, clear, rescanLibrary };
}