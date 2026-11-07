# Album Studio changes (based on user-edited src.zip)

- Default album generation uses each photo once, two photos per interior page. Eight photos => four interior pages. Covers are separate visual assets.
- Add photo selector excludes images already used elsewhere in the album, preventing accidental repeats.
- Delete selected page and move selected page up/down.
- Reorder selected photos within a page and remove a photo without deleting its original.
- Tightened page margins and made filmstrip/minimal layouts use more page area.
- Preserved all other source files from the uploaded archive.

This is a source-only archive, matching the user's upload. Copy src/ into your existing project, and retain your existing package.json, node_modules, and other project files. Back up IndexedDB albums first. No runtime build verification was possible in this environment.
