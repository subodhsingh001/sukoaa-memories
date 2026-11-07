# SUKOAA commerce readiness and deployment gates

**Print ordering and payment collection are not live in this project.** No merchant credentials, verified printer catalog, taxes, shipping contracts or payment accounts were supplied. The `/api/print/quote` and `/api/print/order` endpoints intentionally return HTTP 503 rather than invent prices or claim to place orders.

## To activate production commerce

1. Register and verify merchant accounts (India: evaluate Razorpay; international collections depend on approval and regulations). Confirm cross-border tax and fulfillment obligations.
2. Choose a printer by **actual** catalog, sample-book quality, country coverage, delivery cost and documented PDF requirements. Implement the `PrinterAdapter` contract in `src/lib/commerce/orders.ts` using the selected provider's current API specification.
3. Set up PostgreSQL (orders, payment events, printer jobs, immutable album revision hashes), a durable job queue and encrypted temporary object storage for approved print files. Keep originals local during editing.
4. Implement server-side pricing and quotes. Never accept price or payment success from the browser. Create payment orders server-side, verify webhook signatures against raw request bodies, store webhook IDs, and make fulfillment idempotent.
5. Require user approval before uploading print PDFs. Add printer-specific cover/spine and bleed generation, actual provider file validation and physical proof orders. Current PDFs are **draft proofs**, not certified print assets.
6. Create an order dashboard, failure/retry/refund flows, shipping tracking and retention/deletion policy for print files. Enable order routes only after full integration and tests.

## Privacy statement

AI photo analysis and album editing run locally. If users choose physical printing, final approved print files **must** be transferred to the selected print provider with explicit consent. Do not claim images never leave the device when printing is enabled.

## Local-first Auto-Album

The album editor now offers on-device image sharpness and resolution inspection, perceptual duplicate suppression, timestamp event clustering, configurable page budgets, and layout suggestions. GPS and face-aware cropping need additional EXIF and face detection integration and are **not** represented as finished. The generated album remains editable; unused photos stay in the library.
