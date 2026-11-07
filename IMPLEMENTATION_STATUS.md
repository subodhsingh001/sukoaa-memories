# SUKOAA implementation status — 7 November 2026

## Implemented in this patch
- Blur score from a 384px working image, using Laplacian variance; quality score normalized logarithmically.
- Auto-Album perceptual hash now uses the same 9x8 difference-hash method as the AI analysis module. Older hash caches must be recomputed.
- EXIF capture dates and GPS extracted locally with `exifr` during main photo import; absent capture dates stay unknown rather than pretending import timestamps are capture dates.
- Auto-Album passes GPS through to event clustering.
- Legacy Memory Desk hook updated to use the current IndexedDB photo schema and no longer blocks hydration on React Strict Mode remount.
- Four deterministic tests for page budget, duplicate-free placement, GPS/time clustering and quality/hash calculations.

## Not complete — do not enable commercial sales
- No face detector or safe face crop; default contain fit is retained.
- No validated HEIC decoding/conversion across browsers; HEIC may require a conversion library or server-assisted opt-in flow.
- No live print provider, live payment gateway, credentials, order storage or fulfillment webhooks; quote and order endpoints intentionally return 503.
- Print PDF is a proof, not a certified production file; no printer-specific cover/spine/bleed validation.
- Dependency installation, full TypeScript build and browser QA could not be performed in this environment because npm registry DNS failed.

## Install
Run `npm install` (not `npm ci` on first run: exifr was added but the lockfile could not be refreshed offline), then `npm run typecheck`, `npm run build`, and `npm run test:autoalbum`.

Existing photos remain in IndexedDB. EXIF data is read on newly imported photos; existing records are not automatically reprocessed. Export a backup before upgrading.
