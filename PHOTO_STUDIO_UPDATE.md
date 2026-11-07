# SUKOAA Photo Studio Update

- Memory Desk photo cards use native pointer capture instead of Framer Motion drag to avoid the reported PhotoCard runtime issue.
- Memory Desk sidebar now has **Re-scan EXIF metadata**. Existing photos are rescanned from retained original blobs when possible.
- Memory Desk photo inspector has **Fix blur / Crop / Enhance**.
- Storybook, Cinema and overview photo tiles can open the same photo editor by clicking a photo. Album Studio offers **Open photo enhancement studio** for the selected photograph.
- New editor includes brightness, contrast, saturation, basic sharpening, crop zoom and focal position, reset and original restoration. Save generates a JPEG derivative while retaining the original Blob in IndexedDB.
- Existing album views refresh their photo assets when navigated to after saving.
- Soft daylight theme added to dashboard, navigation and major panels.

## Limitations
- Sharpening is not neural deblurring, restoration or AI upscaling. It cannot reconstruct severe blur.
- The editor exports a maximum 4096px long-edge JPEG; originals are retained but enhanced derivative may be unsuitable for very large print products.
- Face-aware album crop is a separate existing feature. Live print/payment services remain unconfigured.
- Full browser/device test and production build require dependencies; validate before deployment.
