# SUKOAA build blocker fixes (7 November 2026)

Fixed: MediaPipe invalid 0.10.22 version -> 0.10.21; client directive order in MemoriesApp; duplicated metadata binding in useLocalPhotos; named heicTo import; Transformers.js top_k argument. Removed stale package-lock.json (regenerate with npm install).

## Face model privacy and offline support
Face detection now points to local `/mediapipe/wasm` and `/mediapipe/models/blaze_face_short_range.tflite`. The model weights are NOT bundled: downloading them is blocked in this build environment. After `npm install`, run `npm run setup:face-assets` to copy the installed MediaPipe WASM assets to public. Obtain the compatible BlazeFace short-range `.tflite` model from the official MediaPipe model repository and place it at `public/mediapipe/models/blaze_face_short_range.tflite` (check the model license). Without that model, the face-detection action cannot run; no silent remote fallback is configured.

## Verification
On Node.js v24.21.0, `npm run typecheck`, `npm run lint`, `npm run test:autoalbum`, and `npm run build` pass. ESLint and Next.js report non-blocking existing warnings. A fresh dependency install and device testing have not been performed. Existing photo EXIF rescanning, print payment, and fulfillment remain unfinished.

## Commands
`npm install`
`npm run setup:face-assets`
`npm run typecheck`
`npm run test:autoalbum`
`npm run build`
