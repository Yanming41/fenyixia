## 1. Global Debug State

- [x] 1.1 Create `src/contexts/DebugContext.tsx` with a provider that holds the `CFG` state and visual toggle booleans (shadow, texture, sheen, fps).
- [x] 1.2 Wrap the application root in `DebugProvider` (in `main.tsx` or `App.tsx`).

## 2. Dynamic Carousel Configuration

- [x] 2.1 Refactor `src/components/BillCardCarousel/BillCardCarousel.tsx` to read its `CFG` parameters from `useDebugContext()` instead of the statically imported constant.
- [x] 2.2 Wire up the visual toggles (e.g., toggling shadows or textures) by conditionally applying classes or styles to the main `.app` container in `HomePage.tsx` or `App.tsx`.

## 3. Debug Console UI

- [x] 3.1 Create `src/components/Debug/DebugConsole.tsx` porting the layout and HTML structure of the legacy `#debug-panel`.
- [x] 3.2 Implement drag/minimize logic for the `DebugConsole` using framer-motion or standard React state.
- [x] 3.3 Wire the sliders and toggles inside `DebugConsole.tsx` to the setter functions provided by `useDebugContext()`.
- [x] 3.4 Mount `DebugConsole` globally in `App.tsx` (conditionally rendering if a "debug mode" flag is on, or just absolutely positioned).

## 4. Verification

- [x] 4.1 Test opening the debug console, dragging it around.
- [x] 4.2 Adjust sliders natively adjusting carousel swipe distances and spring curves in real-time.
- [x] 4.3 Check that toggling shadows, textures, and sheen instantly reflects the visual state of the application.
