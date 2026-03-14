## Context

The React SPA rewrite successfully ported the visual design and data layer, but two critical regressions occurred:
1. **Carousel Physics**: The `BillCardCarousel` component was rewritten using `framer-motion`. However, the drag handling is too restrictive — it only allows snapping to adjacent cards (±1 index) regardless of how fast or far the user swipes. The original implementation allowed "flinging" through multiple cards. Also, the physical feel (springs vs CSS transitions) doesn't perfectly match the original "pop" and "bounce".
2. **Missing Bottom Navigation**: The original app had a persistent bottom navigation bar containing tabs and a central floating "Add Bill" (+) button. This was entirely omitted from the React rewrite, leaving users with no way to navigate or create new bills.

## Goals / Non-Goals

**Goals:**
- Fix `BillCardCarousel` so fast/long swipes can traverse multiple cards.
- Restore the bottom navigation bar and the "Add Bill" action.
- Update `HomePage` layout to accommodate the bottom nav without clipping content.

**Non-Goals:**
- Removing `framer-motion`. We will stick with framer-motion but fix its mathematical usage.
- Implementing the actual "Add Bill" form logic if it doesn't already exist (we just need the button and shell integration).

## Decisions

### 1. Carousel Drag Calculation
**Current state**: The `handlePanEnd` logic uses `offset > 0 ? curIdx + 1 : curIdx - 1` and has a hardcoded secondary check `velocity > 800` that is flawed and often ignored.
**Decision**: Calculate the specific target index based on the drag offset plus a projection of velocity (inertia). 
- Target index = `Math.round(current_index - drag_offset - (velocity * INERTIA_RATIO))`
- Clamp the target between `0` and `bills.length - 1`.
**Rationale**: This mathematically mimics natural scroll inertia, allowing a hard swipe to accurately land 3-4 cards away, matching the legacy Vanilla JS behavior.

### 2. Restoring Bottom Navigation
**Decision**: Create `src/components/Layout/BottomNav.tsx` containing the standard tab buttons and the central `+` action. Inject this into `App.tsx` or `HomePage.tsx`.
**Rationale**: The CSS for `bottom-nav`, `nb`, `add-btn` already exists in `global.css` (lines 382-401). We just need to implement the JSX markup and ensure the main container has enough bottom padding (`paddingBottom: calc(env(safe-area-inset-bottom) + 60px)` or similar).

## Risks / Trade-offs

- **Risk**: Flinging too many cards might cause performance drops due to simultaneous layout recalculations.
  - **Mitigation**: framer-motion manages hardware acceleration well via `transform`. We will ensure `will-change` is maintained on the cards.
- **Risk**: Bottom Nav might overlap with Android/iOS system gesture bars.
  - **Mitigation**: Utilize existing `env(safe-area-inset-bottom)` in CSS.
