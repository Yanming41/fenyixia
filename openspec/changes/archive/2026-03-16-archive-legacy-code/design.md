## Context
The repository went through a migration from a vanilla JS/HTML implementation to a modern React/Vite stack. Throughout this process, several old files from the root directory and unused React components were left behind to ensure nothing was broken during the transition. Now that the application is fully functional on the new stack, these legacy files are dead code and add unnecessary clutter.

## Goals / Non-Goals

**Goals:**
- Clean up the repository root by moving obsolete vanilla JS and HTML files into a `legacy/` directory.
- Relocate or remove unused React components (`EmailVerificationBanner.tsx`, `Avatar.tsx`) and hooks/API files (`reactions.ts`) to `legacy/`.
- Improve the Signal-to-Noise ratio when searching the codebase.

**Non-Goals:**
- Modifying any of the currently active code in `src/`.
- Changing the application's build process or runtime behavior.
- Deleting the files completely (for now, they will just be archived, allowing easy reference if needed in the short term).

## Decisions
- **Decision:** Move files to a `legacy/` directory rather than immediate deletion.
  - **Rationale:** Preserves historical context temporarily. If a piece of old logic needs to be referenced (e.g., how splitting was calculated in the old `app.js`), it will still be easily accessible without digging through Git history.
  - **Alternatives Considered:** Complete deletion. Rejected to err on the side of caution while the new React codebase matures.

## Risks / Trade-offs
- **[Risk] Broken Imports:** Moving components out of `src/` might break the build if they are actually used.
  - **Mitigation:** A `knip` analysis and manual `grep` were already performed to confirm these files are definitively unreferenced. We will run `npm run build` or type-checking after the move to verify.
