"use client";

import { useRef } from "react";
import {
  Upload,
  Layers3,
  Trash2,
  Palette,
} from "lucide-react";
import { useMemoryStore } from "@/stores/useMemoryStore";

interface Props {
  onUpload: (files: File[]) => Promise<void>;
  onTidy: () => Promise<void>;
  onClear: () => Promise<void>;
}

export default function DeskToolbar({
  onUpload,
  onTidy,
  onClear,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const theme = useMemoryStore((s) => s.theme);
  const setTheme = useMemoryStore((s) => s.setTheme);

  return (
    <div className="flex max-w-full flex-wrap items-center gap-2 rounded-2xl border border-white/15 bg-black/55 p-2 text-white shadow-2xl backdrop-blur-xl">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          void onUpload(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />

      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-black"
      >
        <Upload size={16} />
        Upload
      </button>

      <button
        onClick={() => void onTidy()}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/10"
      >
        <Layers3 size={16} />
        Tidy
      </button>

      <button
        onClick={() =>
          setTheme(theme === "walnut" ? "felt" : "walnut")
        }
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/10"
      >
        <Palette size={16} />
        {theme === "walnut" ? "Walnut" : "Felt"}
      </button>

      <button
        onClick={() => void onClear()}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-200 hover:bg-red-500/20"
      >
        <Trash2 size={16} />
        Clear
      </button>
    </div>
  );
}