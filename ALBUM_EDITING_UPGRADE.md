# Album editing upgrade

- Select a photo in Album Studio to use **Make this photo full page**, **Enhance colors + clarity**, **Move photo to next page**, or **Move photo to page**.
- Full-page uses a borderless page composition in the editor and proof PDF. It is **not a printer-certified bleed PDF**.
- Enhancement is non-destructive and persisted in the album placement; preview applies brightness, contrast, saturation, and proof PDF adds conservative edge sharpening. It cannot reconstruct truly blurred detail or provide AI super-resolution.
- Moving a photo preserves its placement, removes it from the source page, and can create a new destination page. Originals remain in the library.
- Full-page creates a following page for the other photos previously on that page, retaining them in the album.
- Requires npm install, typecheck, build and browser validation in a connected environment.
