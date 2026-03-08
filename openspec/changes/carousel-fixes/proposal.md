## Why

The React SPA rewrite introduced regressions in the Bill Card Carousel and overall application layout. The swipe gesture on the carousel only allows moving one card at a time regardless of swipe speed or distance, the inertia physics are incorrect, and the snapping animation is lacking the original "pop/bounce" effect. Additionally, the bottom navigation bar (containing the "Add Bill" button and other primary app navigation) is completely missing from the new implementation.

## What Changes

- **Carousel Swipe Range**: Update `BillCardCarousel.tsx` pan handling to allow swiping past multiple cards based on drag velocity and distance.
- **Carousel Physics**: Refine the framer-motion transition settings to match the original spring/inertia feel.
- **Bottom Navigation**: Create and integrate a new `BottomNav.tsx` component that restores the missing navigation buttons and central "Add Bill" floating button.
- **App Layout**: Adjust the main layout in `HomePage.tsx` to accommodate the bottom navigation bar correctly so it doesn't overlap the carousel.

## Capabilities

### Modified Capabilities
- `bill-carousel`: Behavior needs to be updated to match the original swipe distance/velocity requirements and physics.
- `react-app-shell`: Layout needs to include the restored bottom navigation bar.

## Impact

- Modifies `src/components/BillCardCarousel/BillCardCarousel.tsx` for gesture handling
- Adds `src/components/Layout/BottomNav.tsx`
- Modifies `src/pages/HomePage.tsx` layout
- Modifies `src/styles/global.css` if necessary for bottom nav positioning
