## Why

Current app is built with vanilla HTML/JS (~7000 lines across multiple files) with manual DOM manipulation, imperative state management, and no module system. As the feature set grows (bill carousel, split details, receipt scanning, payment proofs, anger reactions), the codebase has become hard to maintain and extend. Migrating to React + TypeScript + Vite provides component-based architecture, type safety, and a modern dev experience.

## What Changes

- **BREAKING**: Replace all vanilla HTML/JS files (`app.js`, `split-app.js`, `aa-split-v4.html`, `create-user.html`, `styles.css`, `split-styles.css`) with a React SPA
- Introduce Vite + React + TypeScript project scaffolding (`package.json`, `tsconfig.json`, `vite.config.ts`)
- Convert `supabase.js` (500 lines) into a typed Supabase service layer using `@supabase/supabase-js` npm package
- Rewrite bill card carousel (custom swipe/inertia animation in `app.js` ~1250 lines) as React components using `framer-motion`
- Rewrite split detail view (`split-app.js` ~1900 lines) as React components with proper state management
- Add `react-router-dom` for SPA routing between views (login, bill carousel, split detail)
- Retain all existing Supabase backend (tables, RLS, edge functions) unchanged

## Capabilities

### New Capabilities
- `react-app-shell`: Vite + React + TypeScript project structure, routing, and app layout
- `supabase-service`: Typed Supabase client wrapping auth, bills CRUD, payment proofs, reactions
- `bill-carousel`: Bill card carousel component with swipe gestures and animation (port from app.js)
- `split-detail`: Split detail view with payment tracking, proof upload, anger system (port from split-app.js)
- `auth-flow`: Login/signup pages and auth state management (port from create-user.html + supabase.js auth)

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **Code**: All frontend files replaced. `supabase.js`, `app.js`, `split-app.js`, HTML files, CSS files all replaced by `src/` directory
- **Dependencies**: New npm packages: `react`, `react-dom`, `react-router-dom`, `framer-motion`, `@supabase/supabase-js`, plus dev deps for TypeScript/Vite
- **Backend**: No changes to Supabase schema, RLS policies, or edge functions
- **Deployment**: Build output changes from static HTML to Vite build (`dist/`)
