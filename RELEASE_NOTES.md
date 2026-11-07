# SUKOAA Album Studio — Workspace and crash repair

- Fixed the AI Story generator crash when an imported photo has a missing/null note.
- Album editing now uses the entire viewport width and hides the outer app navigation; Dashboard remains accessible from the top header.
- Existing Hide Pages, Hide Tools and Focus Mode buttons continue to work.
- Added Undo/Redo (50 in-session steps, Ctrl+Z/Ctrl+Y) and Duplicate Page.
- Added a Center Photograph control.
- No IndexedDB schema changes or automatic photo deletion.

Known limitations: drag-to-resize arbitrary frames, print certification, and advanced AI layout are NOT implemented in this patch. Undo history is in-memory only and resets on reload. No browser validation was possible in this environment.
