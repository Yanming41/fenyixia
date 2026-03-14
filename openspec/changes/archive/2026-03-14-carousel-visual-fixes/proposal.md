## Why

When users swipe the bill card carousel very quickly, the visual presentation breaks down. The cards spread too far apart ("disconnect"), and the active card sinks downwards excessively. This negatively impacts the premium feel of the application and makes fast navigation feel broken and unpolished.

## What Changes

- **Carousel Card Spacing Check**: Ensure that during high-velocity swipes, the calculation for `absO` (absolute offset from center) or the `x` translation clamping prevents the cards from spreading out linearly beyond their intended overlapping formation.
- **Carousel Vertical Sinking Check**: Ensure the `y` calculation (currently something like `y = absO * 60`) is clamped or constrained so that cards further away from the center don't sink off the bottom of the screen.
- **Animation Spring Adjustments**: If necessary, refine the mathematical relationship between offset distance and scale/translate to maintain the tightly-packed stacked card look even when swiping through many cards rapidly.

## Capabilities

### Modified Capabilities
- `bill-carousel`: Visual layout calculations (offset, spacing, scaling, and vertical translation) need to be constrained to handle multi-card fast swipes gracefully without breaking the stacked card illusion.

## Impact

- Modifies `src/components/BillCardCarousel/BillCardCarousel.tsx` (specifically the `getCardStyle` visual logic).
