# Book preview repair

- Replaced the old book scene with an explicit photo-textured left/right page spread.
- Textures are composed from the persisted image Blob rather than relying on object URLs in the 3D scene.
- Raised the photo planes above the paper geometry to prevent z-fighting and hidden photographs.
- Added a visible **View flat spread** toggle to diagnose WebGL issues and always see photos.
- Shared `pageRects()` layout logic across the 2D editor, 3D page textures and PDF exporter.
- Collage, triptych, pair, and hero layouts now have different compositions.
- Kept the original Storybook and album data unchanged.

Run `npm ci`, `npm run typecheck`, and `npm run build`. This environment could not finish dependency installation, so runtime and production build are not verified.

If the 3D view is still empty, use **View flat spread** and inspect the browser console for canvas/WebGL errors. Photos are stored in your browser's IndexedDB and are not included in the project ZIP.
