# SUKOAA Memories — Album Studio Upgrade

Next.js App Router, TypeScript, browser-local IndexedDB, Framer Motion, Zustand, optional Transformers.js image classification.

## Start

```bash
npm install
npm run dev
```

Open http://localhost:3000. Run `npm run typecheck`, `npm run lint`, and `npm run build` before deploying.

## Album Studio (new)

- 12 distinct themed album cover templates, square 8x8 in and landscape 11x8.5 in.
- Automatic date-based placement across hero, pair and collage pages (not AI subject analysis).
- Editable pages, captions, photo selection, fit/cover, focal-point sliders and zoom.
- Three.js / React Three Fiber 3D hardcover preview with orbit and animated page turns.
- Album projects saved in the same IndexedDB origin. JSON project export contains layout metadata and photo IDs, not image bytes; retain the photo library and its separate backup.
- Client-side PDF download via jsPDF, rendered at a target image raster resolution. This is a print draft, **not a preflight-certified commercial print file**: printer-specific bleed, CMYK profiles, spine and binding specs are not provided. No print ordering or payment integration.
- Original desk photos now use contain fitting to avoid cutting off faces.

## Included

- Welcome screen, no account required
- Home dashboard: recent photos, On This Day, collection cards
- Memory Desk from the supplied project: drag, scatter, tidy, image import, notes, favourites, backup/restore, theme and three physical environments
- Collection overview and six optional default collections
- Timeline grouped by year
- Interactive Storybook
- Cinema slideshow
- AI Studio: local color analysis, perceptual duplicate detection, optional ViT classifier downloaded on explicit opt-in, template story
- Privacy/settings page with approximate storage usage and destructive-delete confirmation

## Known limitations

- The project passes local typecheck, lint, album tests, and a Next.js production build. It is **not a fully verified production release**; device testing and a fresh dependency install have not been completed.
- Advanced local caption generation, semantic CLIP search, restoration, WebGPU acceleration, actual rigid-body collision, robust multi-select, infinite zoom/pan and complete undo/redo are **not implemented**. Do not interpret the AI studio as a generative model.
- AI model weights require internet to download and local inference depends on browser/hardware. Original images are not intentionally uploaded.
- IndexedDB can be erased by browser/site data cleanup. Export a backup before migrating from localhost to a production domain.
- Existing photos stored by the previous version under the same origin and IndexedDB schema should remain available; back up before replacing an existing deployment.

## Limitations of Album Studio

The automatic layout is deterministic and chronological, not AI-powered semantic photo analysis. The optional AI Studio classifier remains separate. The 3D book uses flat animated pages rather than physically simulated curled paper. Browser PDF generation can be memory-intensive for large albums. Test the PDF with your printer and keep an external backup of photos.
