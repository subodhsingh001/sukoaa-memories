# Face-aware cropping and HEIC import

- HEIC/HEIF is detected by MIME, extension or ISO BMFF brand signature. Browser native decoding is attempted first, followed by `heic-to` JPEG conversion. Metadata is read from the ORIGINAL file before conversion. The normalized blob is saved in IndexedDB; the original file is not persisted separately. Conversion errors are shown as import failures.
- Album Studio > Auto-Album settings > **Protect faces on all pages** runs MediaPipe face detection in the browser and adjusts image placement to `cover` when the detected faces fit. Otherwise uses `contain` and reports a warning. Crops remain editable and the PDF renderer reads the saved placement.
- First use downloads model weights and WASM from Google/CDN. Photos are processed locally; a network connection is needed to obtain the model. For offline use, vendor the model and WASM assets into `public/` and change the two URLs in `src/lib/images/faceCrop.ts`.
- HEIC variants, multi-image HEIF, orientation, color profiles, browser compatibility and print proof need validation with real device samples. The current PDF remains a proof, not a printer-certified file.
- Run `npm install`, `npm run typecheck`, `npm run build` after installing dependencies. No live commerce functionality is implied.
