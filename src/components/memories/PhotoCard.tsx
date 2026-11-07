"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  animate,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import type { PhotoItem } from "@/types/photo";
import { useMemoryStore } from "@/stores/useMemoryStore";
import { updateStoredPhoto } from "@/lib/db";

interface Props {
  photo: PhotoItem;
}

const spring = {
  type: "spring" as const,
  stiffness: 340,
  damping: 30,
  mass: 0.75,
};

export default function PhotoCard({ photo }: Props) {
  const x = useMotionValue(photo.x);
  const y = useMotionValue(photo.y);

  const dragging = useRef(false);
  const latestZ = useRef(photo.zIndex);

  const bringToFront = useMemoryStore(
    (s) => s.bringToFront
  );

  const updatePosition = useMemoryStore(
    (s) => s.updatePosition
  );

  useMotionValueEvent(x, "change", () => {
    // Motion values update without React re-rendering.
  });

  useEffect(() => {
    if (dragging.current) return;

    const xAnimation = animate(x, photo.x, spring);
    const yAnimation = animate(y, photo.y, spring);

    return () => {
      xAnimation.stop();
      yAnimation.stop();
    };
  }, [photo.x, photo.y, x, y]);

  async function handleDragEnd() {
    dragging.current = false;

    const nextX = x.get();
    const nextY = y.get();

    updatePosition(photo.id, nextX, nextY);

    try {
      await updateStoredPhoto(photo.id, {
        x: nextX,
        y: nextY,
        zIndex: latestZ.current,
      });
    } catch (error) {
      console.error("Position save failed:", error);
    }
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.04}
      onDragStart={() => {
        dragging.current = true;
        latestZ.current = bringToFront(photo.id);
      }}
      onDragEnd={() => void handleDragEnd()}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{
        scale: 1.04,
        rotateX: 3,
        rotateY: -3,
      }}
      whileDrag={{
        scale: 1.1,
        rotateX: 7,
        rotateY: -6,
        cursor: "grabbing",
      }}
      transition={spring}
      style={{
        x,
        y,
        rotate: photo.rotation,
        zIndex: photo.zIndex,
        touchAction: "none",
        transformStyle: "preserve-3d",
      }}
      className="absolute left-1/2 top-1/2 w-44 cursor-grab select-none rounded-sm bg-[#fffdf8] p-3 pb-9 shadow-[0_18px_45px_rgba(0,0,0,0.45)] sm:w-52"
    >
      <div className="aspect-square overflow-hidden bg-neutral-200">
        <img
          src={photo.url}
          alt={photo.name}
          draggable={false}
          className="pointer-events-none h-full w-full object-cover"
        />
      </div>

      <p className="mt-3 truncate text-center font-serif text-xs text-neutral-600">
        {photo.name}
      </p>
    </motion.div>
  );
}