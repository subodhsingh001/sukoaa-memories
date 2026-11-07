# Database compatibility fix

`src/lib/db.ts` now exports `getPhotos`, `getPhoto`, `savePhoto`, `updateStoredPhoto`, and `clearStoredPhotos`, in addition to the current Album Studio API.

All operations use the existing `sukoaa-memories` IndexedDB database and `photos` object store. No database reset is required.

**Note:** The legacy `PhotoCard` / `useLocalPhotos` code from earlier milestones uses a different photo shape (`zIndex`, `createdAt`) from this project's current photo record (`z`, `addedAt`, etc.). Do not paste the legacy components into this version unchanged. Use the included current components. If migrating legacy records, export/back up your photos first.

To verify locally: `npm install && npm run typecheck && npm run build`.
