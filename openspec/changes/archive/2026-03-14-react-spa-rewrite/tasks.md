## 1. Project Scaffolding

- [x] 1.1 Initialize Vite + React + TypeScript project: create `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`
- [x] 1.2 Install dependencies: `react`, `react-dom`, `react-router-dom`, `framer-motion`, `@supabase/supabase-js`
- [x] 1.3 Create `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [x] 1.4 Create `src/App.tsx` with router setup (routes: `/`, `/login`)
- [x] 1.5 Create `src/styles/global.css` with base styles and CSS variables ported from existing CSS

## 2. Types & Supabase Service

- [x] 2.1 Create `src/lib/types.ts` with TypeScript interfaces: `User`, `Bill`, `BillItem`, `PaymentProof`, `Reaction`
- [x] 2.2 Create `src/lib/supabase.ts` with Supabase client initialization from env vars
- [x] 2.3 Port auth functions: `getCurrentUser`, `signUp`, `signIn`, `signOut`, `onAuthChange`
- [x] 2.4 Port bills CRUD: `fetchMyBills`, `createBill`, `updateBill`, `deleteBill`, `toggleSettled`, `normalizeBill`
- [x] 2.5 Port friend functions: `getFriends`, `addFriend`
- [x] 2.6 Port payment proof functions: `uploadPaymentProof`, `getPaymentProofs`
- [x] 2.7 Port reaction functions: `addAnger`, `getUnseenAnger`, `markAngerSeen`

## 3. Auth Flow

- [x] 3.1 Create `src/hooks/useAuth.ts` with `AuthContext` and `AuthProvider` (wraps `onAuthChange`)
- [x] 3.2 Create `src/components/Auth/Login.tsx` with email + PIN form
- [x] 3.3 Create `src/components/Auth/Signup.tsx` with email, PIN, name, emoji, color form
- [x] 3.4 Add protected route wrapper in `App.tsx` that redirects to `/login` if unauthenticated

## 4. Layout & Header

- [x] 4.1 Create `src/components/Layout/Header.tsx` with iOS-style navigation bar (title, avatar, subtitle)
- [x] 4.2 Create `src/components/Layout/Avatar.tsx` for user avatar display

## 5. Bill Card Carousel

- [x] 5.1 Create `src/hooks/useBills.ts` hook for fetching and managing bills data
- [x] 5.2 Create `src/components/BillCardCarousel/BillCard.tsx` with card content (icon, title, amount, members, date)
- [x] 5.3 Create `src/components/BillCardCarousel/BillCardCarousel.tsx` with framer-motion drag gestures, stacked card layout, and animation parameters (STEP, SCALE_STEP, Y_STEP, OPACITY_STEP)
- [x] 5.4 Implement inertia physics and pop/bounce effect on card selection
- [x] 5.5 Implement tap-to-navigate: center card goes to detail, side card scrolls to center
- [x] 5.6 Create `src/components/BillCardCarousel/SummaryCards.tsx` with 4 summary values (collected/pending for both sides)

## 6. Split Detail View

- [x] 6.1 Create `src/components/SplitDetail/SplitDetail.tsx` main page with bill info, items breakdown, and member list
- [x] 6.2 Create `src/components/SplitDetail/PaymentProof.tsx` for viewing and uploading payment proofs
- [x] 6.3 Create `src/components/SplitDetail/BillSheet.tsx` for bill editing sheet (title, icon, items, members)
- [x] 6.4 Implement anger/protest button and unseen anger notifications
- [x] 6.5 Implement settled toggle for bill payer

## 7. Styling & Polish

- [x] 7.1 Port remaining CSS from `styles.css` and `split-styles.css` into component-specific styles
- [ ] 7.2 Verify all views match existing visual design (gradients, blur, rounded corners, iOS patterns)
- [ ] 7.3 Test full flow: login → carousel → detail → edit → back
