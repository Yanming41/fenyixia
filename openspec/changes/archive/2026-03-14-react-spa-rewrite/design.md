## Context

"Fenyixia" (分一下) is a roommate bill-splitting app currently built as vanilla HTML/JS with Supabase backend. The frontend consists of two main views:

1. **Bill Carousel** (`app.js` + `styles.css`) - A custom card carousel with swipe gestures, inertia physics, scale/opacity animations, and per-card detail overlays
2. **Split Detail** (`split-app.js` + `split-styles.css`) - Detailed bill view with payment tracking, proof uploads, anger/protest system, and bill editing

Both views share a Supabase data layer (`supabase.js`) that handles auth, CRUD operations, and file uploads. There's also a `create-user.html` for signup/login.

The app is designed mobile-first with iOS-style UI patterns (large titles, sheet modals, card stacks).

## Goals / Non-Goals

**Goals:**
- Establish a React + TypeScript + Vite project structure that replaces all existing frontend code
- Port all existing functionality 1:1 (carousel, split detail, auth, receipt scanning)
- Use `framer-motion` for carousel animations (replacing manual `requestAnimationFrame` + transform logic)
- Use `react-router-dom` for view navigation
- Create a typed Supabase service layer (replace `window.DB` global)
- Maintain the exact same visual design and interaction feel

**Non-Goals:**
- Redesigning the UI or adding new features
- Changing the Supabase schema or backend logic
- Adding state management libraries (Redux, Zustand) - use React context + hooks
- Adding testing infrastructure (can be added later)
- PWA/offline support
- i18n (keep existing Chinese UI text)

## Decisions

### 1. Project Structure

```
src/
  main.tsx                    # Entry point
  App.tsx                     # Router setup
  lib/
    supabase.ts               # Supabase client + typed service functions
    types.ts                  # Shared TypeScript types (Bill, User, etc.)
  components/
    BillCardCarousel/          # Carousel view (from app.js)
      BillCardCarousel.tsx
      BillCard.tsx
      CardDetail.tsx
    SplitDetail/               # Split detail view (from split-app.js)
      SplitDetail.tsx
      SummaryCards.tsx
      BillList.tsx
      BillSheet.tsx
      PaymentProof.tsx
    Auth/
      Login.tsx
      Signup.tsx
    Layout/
      Header.tsx
      Avatar.tsx
  hooks/
    useAuth.ts                 # Auth state context + hook
    useBills.ts                # Bills data fetching hook
  styles/
    global.css                 # Base styles, CSS variables
```

**Rationale**: Feature-based grouping keeps related code together. No barrel files or deep nesting.

### 2. Animation Strategy: framer-motion

The existing carousel uses manual `requestAnimationFrame` with computed transforms (translateX, scale, translateY, opacity) driven by a `curIdx` offset. This will be ported to `framer-motion`'s `useMotionValue` + `useTransform` + drag gestures.

Key animation parameters to preserve from `CFG`:
- `STEP: 148px` card spacing
- `SCALE_STEP: 0.13` per-position scale reduction
- `Y_STEP: 14px` per-position vertical offset
- Inertia physics with velocity-based duration
- Pop/bounce effect on card selection

**Rationale**: framer-motion provides gesture handling (drag, tap), spring physics, and GPU-accelerated transforms out of the box, replacing ~400 lines of manual animation code.

### 3. Routing

```
/              → BillCardCarousel (main view)
/split/:id     → SplitDetail (bill detail)
/login         → Login
/signup        → Signup
```

**Rationale**: Simple flat routes. No nested routing needed. `react-router-dom` v7 handles navigation with browser history.

### 4. State Management: React Context + Hooks

- `AuthContext` - provides current user, login/logout functions
- `useBills()` hook - fetches bills, provides CRUD operations
- No global state library needed - the app has simple data flow

**Rationale**: The app has a small state surface. Auth is global, bills are fetched per-view. Context + hooks is sufficient without adding complexity.

### 5. Supabase Client

Convert `supabase.js` functions into typed async functions. Replace `window.DB` global with ES module imports. Keep the same Supabase client initialization but use the npm package instead of CDN.

**Rationale**: Direct port with type safety. Same API surface, just modernized.

### 6. CSS Strategy

Port existing CSS into `global.css` with minimal changes. Use CSS modules or inline styles only where component-scoping is needed. Keep the existing iOS-style design system (gradients, blur, rounded corners).

**Rationale**: The existing CSS is well-structured. A full CSS-in-JS migration would add complexity without benefit for this app size.

## Risks / Trade-offs

- **Animation fidelity**: The custom carousel physics (inertia curves, scale exponents) may behave slightly differently with framer-motion springs vs. manual easing. Mitigation: tune spring parameters to match existing feel, keep CFG constants.
- **Bundle size increase**: React + framer-motion adds ~50-80KB gzipped. Mitigation: acceptable for this app, and Vite tree-shaking helps.
- **Big-bang rewrite risk**: Replacing all frontend code at once means no incremental deployment. Mitigation: existing vanilla code stays on main as fallback; the rewrite is a single coordinated effort.
- **Supabase key exposure**: The existing code has the Supabase anon key hardcoded. Mitigation: move to `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (still public, but better practice).
