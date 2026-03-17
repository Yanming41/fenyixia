## Why
The repository contains numerous legacy vanilla JS and HTML files in the root directory that are leftovers from before the React/Vite migration. There are also unused React components and types. Archiving these files will significantly reduce workspace clutter, improve searchability, and prevent confusion for future development.

## What Changes
- Move legacy `.js`, `.html`, and `.css` files from the repository root to a new `legacy/` directory (e.g., `app.js`, `create-user.html`, `split-styles.css`, etc.)
- Move unused React components (`EmailVerificationBanner.tsx`, `Avatar.tsx`) to `legacy/components/` (or simply delete them if preferred, but for now we will archive them per the title).
- Move unused API utilities (`reactions.ts`) to `legacy/lib/api/`.
- Update `tsconfig.json` or `vite.config.ts` if any obsolete references exist (unlikely for dead code).

## Capabilities

### New Capabilities
- `legacy-code-archival`: A structural cleanup tracking the removal and archiving of unused legacy code.

### Modified Capabilities

## Impact
- **Root Directory**: Will be much cleaner, containing primarily config files.
- **`src/` Directory**: Deprecated components and utilities will be removed.
- **No functional impact**: The application's runtime behavior will remain completely unchanged, as all affected files have been verified as dead code.
