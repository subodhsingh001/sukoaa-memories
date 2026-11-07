"use client";

import { useState } from "react";
import PhotoCard from "./PhotoCard";
import DeskToolbar from "./DeskToolbar";
import { useMemoryStore } from "@/stores/useMemoryStore";
import { useLocalPhotos } from "@/hooks/useLocalPhotos";

export default function MemoryDesk() {
  const photos = useMemoryStore((s) => s.photos);
  const theme = useMemoryStore((s) => s.theme);
  const hydrated = useMemoryStore((s) => s.hydrated);

  const { importPhotos, tidy, clear, rescanLibrary } = useLocalPhotos();
  const [scanStatus, setScanStatus] = useState("");
  const [scanning, setScanning] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const background =
    theme === "walnut"
      ? "bg-[repeating-linear-gradient(95deg,#292019_0px,#38291e_36px,#241b16_70px,#493326_105px)]"
      : "bg-[#263c35]";

  return (
    <main
      className={`relative h-dvh overflow-hidden ${background}`}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setDragOver(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        void importPhotos(Array.from(e.dataTransfer.files));
      }}
    >
      {/* Ambient lighting */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_15%,rgba(255,225,180,0.13),transparent_65%)]" />

      {/* Top controls */}
      <header className="absolute inset-x-0 top-0 z-[100000] flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6">
        <div className="text-white">
          <h1 className="text-2xl font-bold tracking-[0.2em]">
            SUKOAA
          </h1>
          <p className="text-[10px] tracking-[0.35em] text-white/60">
            MEMORIES
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" disabled={scanning} className="rounded-lg border border-white/30 bg-black/40 px-3 py-2 text-xs text-white disabled:opacity-50" onClick={async()=>{setScanning(true);try{const result=await rescanLibrary();setScanStatus(`Scanned ${result.scanned} photos; recovered metadata for ${result.updated}. ${result.unavailable} have no recoverable EXIF.`)}catch(e){setScanStatus(`Scan failed: ${String(e)}`)}finally{setScanning(false)}}}>{scanning?'Scanning…':'Re-scan EXIF'}</button>
          <DeskToolbar
          onUpload={importPhotos}
          onTidy={tidy}
          onClear={clear}
        />
        </div>
      </header>

      {scanStatus && <div role="status" className="absolute top-24 left-4 right-4 z-[100001] rounded-lg bg-black/85 px-4 py-3 text-sm text-white">{scanStatus}<button type="button" className="ml-4 underline" onClick={()=>setScanStatus('')}>Dismiss</button></div>}
      {/* Physical desk */}
      <section
        className="relative h-full w-full overflow-hidden"
        style={{ perspective: "1200px" }}
      >
        {!hydrated && (
          <div className="absolute inset-0 flex items-center justify-center text-white/70">
            Restoring your memories...
          </div>
        )}

        {hydrated && photos.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
            <h2 className="font-serif text-3xl sm:text-5xl">
              Your memories belong here.
            </h2>
            <p className="mt-4 text-sm text-white/60">
              Upload or drop photographs onto your desk.
            </p>
          </div>
        )}

        {photos.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} />
        ))}
      </section>

      {/* Drop overlay */}
      {dragOver && (
        <div className="pointer-events-none absolute inset-4 z-[200000] flex items-center justify-center rounded-3xl border-2 border-dashed border-white/70 bg-black/50 text-center text-2xl font-semibold text-white backdrop-blur-sm">
          Drop your memories here
        </div>
      )}

      {/* Bottom privacy label */}
      <div className="pointer-events-none absolute bottom-5 left-1/2 z-[100000] -translate-x-1/2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-center text-xs text-white/70 backdrop-blur-md">
        Private by design · Stored on this device
      </div>
    </main>
  );
}