# SUKOAA reliability update

- Added a **Re-scan EXIF** action to Memory Desk. It scans the original bytes currently stored in IndexedDB and updates missing dates and GPS, without changing existing dates. Some converted HEIC files cannot recover original EXIF; re-import those originals.
- Existing Album Studio retains full-bleed single-photo pages, move to another page, move to next page, undo/redo, and basic color/clarity enhancement.
- Existing enhancement is a CSS preview filter plus conservative export sharpening. It is **not** AI deblurring, AI upscaling, or restoration. No model was bundled for these capabilities.
- Print PDFs remain proofs, not certified production files; live checkout and printer fulfillment remain disabled.
- This source has not been verified with a full npm build because dependencies are unavailable in the execution environment.
