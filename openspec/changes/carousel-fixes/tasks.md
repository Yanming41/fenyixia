## 1. Carousel Physics & Swipe Fixes

- [x] 1.1 Update `BillCardCarousel.tsx` to calculate target index based on swipe distance and velocity projection (inertia).
- [x] 1.2 Fine-tune framer-motion spring transition settings in `BillCardCarousel.tsx` to match original "pop" and "bounce" feel.

## 2. Bottom Navigation Integration

- [x] 2.1 Create `src/components/Layout/BottomNav.tsx` containing the standard tabs (mine, stats) and the primary "Add Bill" (+) floating button.
- [x] 2.2 Wire up CSS classes `bottom-nav`, `nb`, `add-btn` to the new component.
- [x] 2.3 Integrate `BottomNav` into `src/pages/HomePage.tsx` so it sits persistently at the bottom of the screen.
- [x] 2.4 Add bottom padding to `HomePage.tsx` main content area to prevent the carousel and summary cards from being obscured by the new navigation bar.

## 3. Verification

- [x] 3.1 Test multi-card swipe gesture in the browser to ensure fast swipes traverse multiple cards accurately.
- [x] 3.2 Verify the bottom navigation bar appears correctly and doesn't overlap scrollable content.
