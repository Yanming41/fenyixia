## Context

The original vanilla HTML/JS application (split-v4) included a robust `#debug-panel` with sliders and toggles for adjusting carousel physics, animation curves, and visual elements on the fly. This was highly requested by the user to be brought back into the React SPA rewrite. Currently, `BillCardCarousel.tsx` uses a static `CFG` object for its physics parameters.

## Goals / Non-Goals

**Goals:**
- Implement a floating, draggable `DebugConsole` React component.
- Migrate the static `CFG` object into a global state (e.g., React Context) that can be read by `BillCardCarousel` and updated by `DebugConsole`.
- Implement visual toggles (shadows, textures, sheen, fps counter).

**Non-Goals:**
- Implementing the "Sound Effects" and "Random Bill" tools from the legacy console unless strictly required for visual parity, as these involve separate subsystems not yet fully ported.

## Decisions

### 1. State Management for Configurations
**Decision**: Create a `DebugContext` with a React provider (`DebugProvider`) at the root of the application (e.g., wrapping `App` inside `main.tsx`).
**Rationale**: The debug configurations need to be accessed by `BillCardCarousel` (physics) and `HomePage`/`App` (css classes for texture/shadows), and updated by `DebugConsole`. Context is the standard, lightweight React way to provide global state without introducing Redux or Zustand.

### 2. Debug Console Component
**Decision**: Port the HTML structure of the `#debug-panel` into `src/components/Debug/DebugConsole.tsx`. Use standard React state for its local open/closed/dragged state, and bind its inputs (sliders/checkboxes) directly to `DebugContext` updater functions.
**Rationale**: `global.css` already contains all the styling for `#debug-panel`, `.dbg-slider`, `.dbg-toggle`, etc. Porting the markup 1:1 will perfectly restore the visual appearance without needing CSS rewrites.

## Risks / Trade-offs

- **Risk**: Frequent updates from sliders might cause the entire component tree to re-render, hurting performance.
  - **Mitigation**: Ensure `DebugContext` is optimized (memoized values). The carousel itself is the only heavy component reading the physics config.
- **Risk**: Setting CSS toggle states (like dropping shadows globally) might conflict with module CSS if not done at the `body` or `.app` wrapper level.
  - **Mitigation**: We will bind these visual toggles to data-attributes or classes on the main `.app` container wrapper.
