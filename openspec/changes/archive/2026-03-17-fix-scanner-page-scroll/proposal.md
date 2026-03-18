## Why

The `.scanner-page` container (used by `ScanPage` and `QuickBillPage`) cannot be scrolled on mobile devices or in PWA mode. This is because the global `body` has `overflow: hidden;` causing any content exceeding `100vh` to be clipped without a scrollbar, making the bottom of the page (and the critical action buttons) inaccessible to users.

## What Changes

- Update `.scanner-page` CSS in `src/styles/global.css` to enable vertical scrolling (`overflow-y: auto`) and fix its height to `100vh`.

## Capabilities

### New Capabilities
None

### Modified Capabilities
None

## Impact

- `src/styles/global.css`: Modifies `.scanner-page` layout rules.
- Indirectly affects `ScanPage` and `QuickBillPage` components by allowing them to scroll normally on mobile viewports.
