# Print and photo editor fixes

- Missing print images are **album references absent from the current browser IndexedDB library**. A repair action now identifies and removes broken references after confirmation. Re-import originals if available; this tool cannot recover deleted image data.
- Print DPI checks now account for frame shape, cover crops, and zoom. Low-DPI warnings are informational and cannot be solved by sharpening.
- Enhancement now saves the full photograph without permanently cropping its pixels; Storybook and collection tiles show the complete image. Zoom/focus in the shared photo editor are preview-only; album-specific positioning remains in Album Studio.
- Auto-enhance offers conservative color and sharpness defaults and a hold-to-compare control. This is **not** neural AI deblurring. The live preview cannot faithfully display the pixel sharpening operation until saved.
- Production PDF, printer and payment integrations remain out of scope.
- No real-device browser test or dependency-based build has been completed here.
