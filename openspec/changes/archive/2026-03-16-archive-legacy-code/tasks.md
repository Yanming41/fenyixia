## 1. Setup
- [x] 1.1 Create `legacy/` directory structure (`legacy/`, `legacy/components/`, `legacy/lib/api/`)

## 2. Archive Root Files
- [x] 2.1 Move `app.js`, `split-app.js`, and `supabase.js` to `legacy/`
- [x] 2.2 Move `aa-split-v4.html`, `create-user.html`, and `receipt-scanner_final.html` to `legacy/`
- [x] 2.3 Move `split-styles.css` and `styles.css` to `legacy/`

## 3. Archive React Code
- [x] 3.1 Move `src/components/EmailVerificationBanner.tsx` and `src/components/Layout/Avatar.tsx` to `legacy/components/`
- [x] 3.2 Move `src/lib/api/reactions.ts` to `legacy/lib/api/`

## 4. Verification
- [x] 4.1 Run `npm run build` or `npx tsc --noEmit` to ensure no broken imports remain in `src/`
