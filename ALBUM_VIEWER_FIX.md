# Album Studio viewer revision

## Changes
- Replaced the prior single-page rotating 3D scene with a two-page, layflat-style book scene.
- Both visible pages draw photos from the saved album page layouts and crop settings.
- Added a WebGL capability check, React error boundary, and an accessible 2D fallback.
- Improved paper, binding, desk, and lighting presentation.
- Drag inside any photo frame in the 2D editor to reposition the crop. The inspector retains Fit / Fill / Zoom controls.
- All changes remain saved through the existing album IndexedDB persistence layer.

## Known limitations
- Page-turn physics is not a deformable paper simulation; navigation updates the open spread.
- Album layouts are still automatic by date/count, not subject-aware AI.
- Print PDF remains a draft export, not a printer-certified production file.
- This environment could not install dependencies, so TypeScript and production build checks have not been completed.

## Run
npm install
npm run typecheck
npm run build
npm run dev

Do not clear browser storage when upgrading. Back up your library before changing versions.
