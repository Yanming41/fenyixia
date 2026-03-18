## Context

The global CSS for the `分一下` web app prevents viewport scrolling (`overflow: hidden` on `html` and `body`) to create a native-like experience and prevent overscroll rubber-banding.
However, the scanner page container (`.scanner-page`) which houses both `ScanPage` and `QuickBillPage` components does not establish its own scrolling context. As a result, when content bleeds out of the `100vh` viewport, the user cannot scroll down to view it or interact with the buttons at the bottom.

## Goals / Non-Goals

**Goals:**
- Make `.scanner-page` vertically scrollable on all devices.
- Ensure the save/action buttons at the bottom of the scanner flows are accessible.

**Non-Goals:**
- Refactoring the global `overflow: hidden` approach.
- Redesigning the scanner UI.

## Decisions

- **Enable vertical scrolling on `.scanner-page`:** We will explicitly set `height: 100vh;` and `overflow-y: auto;` on the `.scanner-page` CSS class. This is consistent with how other scrollable views (like `BillListView`) are handled in the app.
  - *Alternative considered:* Setting `max-height: 100vh`. Since this acts as the root container for those routes, setting a fixed `height: 100vh` is more robust for creating a scrollable area.

## Risks / Trade-offs

- **Risk:** Safari iOS double scrollbar or bottom safe-area issues. 
  - **Mitigation:** Rely on the existing `padding: 0 0 calc(env(safe-area-inset-bottom, 16px) + 80px);` which is already present on `.scanner-page` to ensure content isn't hidden under the home indicator.
