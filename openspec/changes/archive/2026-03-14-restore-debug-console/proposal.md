## Why

The original vanilla JavaScript application featured a comprehensive "Debug Console" (调试控制台) that allowed users to tweak animation physics parameters, toggle visual features (shadows, textures, etc.), manage sound effects, and monitor real-time rendering stats (FPS). This console was omitted during the React SPA rewrite. Restoring it will give developers and advanced users the ability to test and fine-tune the carousel experience directly within the browser, just like in the original app.

## What Changes

- **Debug Console Component**: Create a new `DebugConsole` React component that replicates the layout, sliders, and toggles of the legacy `#debug-panel`.
- **Global Configuration State**: Move the static `CFG` (carousel configuration) constants in `BillCardCarousel.tsx` into a React context or global state so the debug console can modify them dynamically and the carousel will react to the changes.
- **Toggles Integration**: Implement the visual toggles (shadow, texture, sheen) by binding them to CSS classes or inline styles on the main application container.
- **Floating UI**: Ensure the debug console can be opened, closed, and dragged around the screen without interfering with the underlying app.

## Capabilities

### New Capabilities
- `debug-console`: A floating, draggable panel providing real-time controls over animation physics, visual toggles, and performance monitoring.
- `dynamic-carousel-config`: The bill card carousel's physics and visual layout parameters become entirely dynamic rather than statically compiled.

## Impact

- Adds `src/components/Debug/DebugConsole.tsx`
- Adds `src/contexts/DebugContext.tsx` or similar state management for config
- Modifies `src/components/BillCardCarousel/BillCardCarousel.tsx` to read physics parameters from state instead of static constants.
- Modifies `src/App.tsx` to mount the debug console overlay.
