## 1. Visual Geometry Fixes

- [x] 1.1 Update `getCardStyle` in `BillCardCarousel.tsx` to cap the maximum effective `absO` used for horizontal spreading (e.g., using `Math.min(absO, 2.5)` or a logarithmic scale).
- [x] 1.2 Update the vertical translation (`y`) calculation in `getCardStyle` to cap the maximum vertical drop (e.g., stopping the drop after 3 cards depth).
- [x] 1.3 Update the scaling (`scale`) and opacity (`opacity`) formulas to ensure stacked cards remain visible without fading out too prematurely when flinging.

## 2. Verification

- [x] 2.1 Test in the browser: rapidly swipe through multiple cards and verify that the stack remains tightly grouped and doesn't disappear off the bottom of the screen.
