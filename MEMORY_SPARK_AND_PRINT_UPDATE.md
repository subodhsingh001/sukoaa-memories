# SUKOAA update — memory engagement and print export safety

## Added
- A daily **A memory worth telling** card on Overview. Uses an anniversary photograph when available, otherwise a recent photograph. A visitor can write a private story, save it to the existing IndexedDB photo note, open photo enhancement, or continue to Storybook. No accounts or uploads.
- Soft cream/sage styling and a gentle hover animation for this new card.
- PDF export now refuses to silently omit missing photo references and requests up to 300 DPI rasterization for each slot, subject to a 5500 px cap. This improves exported rasterization but **cannot improve the source photo resolution**.

## Important limitations
- PDF remains a proof, NOT a certified printer production PDF. It has no provider-specific cover, spine, bleed or color workflow. No payment, fulfillment, advertising or monetization is enabled.
- The memory prompt uses the current local date and does not schedule notifications.
- This release does not add neural image restoration, short movie export, or cloud collaboration.
- Full npm install/build/browser tests have not been run in this environment.
