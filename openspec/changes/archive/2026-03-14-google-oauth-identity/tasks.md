## 1. Auth API Layer

- [x] 1.1 Add `signInWithGoogle()` function to `src/lib/api/auth.ts` — calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })`.
- [x] 1.2 Add `getGoogleIdentity()` function — calls `supabase.auth.getUserIdentities()` and returns the Google identity if found.
- [x] 1.3 Add `linkGoogle()` function — calls `supabase.auth.linkIdentity({ provider: 'google', options: { redirectTo } })`.
- [x] 1.4 Add `unlinkGoogle(identityId)` function — calls `supabase.auth.unlinkIdentity()` with the Google identity object.

## 2. useGoogleIdentity Hook

- [x] 2.1 Create `src/hooks/useGoogleIdentity.ts` hook returning `{ googleIdentity, loading, error, link, unlink, refresh }`.
- [x] 2.2 On mount, fetch Google identity status via `getGoogleIdentity()`. Handle loading and error states.
- [x] 2.3 Implement `link()` — call `linkGoogle()`, handle errors with Chinese messages.
- [x] 2.4 Implement `unlink()` — check if Google is the only identity before calling `unlinkGoogle()`. Show warning toast if it's the last method.

## 3. Login Page — Google OAuth Button

- [x] 3.1 Add a "通过 Google 登录" button on the `welcome` step of `LoginPage.tsx`, visually separated from existing buttons with a "或" divider.
- [x] 3.2 Wire the button to call `signInWithGoogle()` from the auth API. Handle errors with a toast.

## 4. Settings Page — Identity Management

- [x] 4.1 Import and use `useGoogleIdentity` hook in `SettingsPage.tsx`.
- [x] 4.2 Add a "账号绑定" section between the profile card and sign-out button showing the Google identity state.
- [x] 4.3 If unlinked: render "绑定 Google 账号" button that calls `link()`.
- [x] 4.4 If linked: render Google email display + "解绑" button that calls `unlink()`.
- [x] 4.5 Show loading spinner and error/success toasts for link/unlink operations.

## 5. Verification

- [x] 5.1 Verify TypeScript compiles cleanly with no errors.
- [x] 5.2 Test Google sign-in flow end-to-end (OAuth redirect → authenticated → home page).
- [x] 5.3 Test link/unlink flow from settings page.
- [x] 5.4 Test error handling: attempt to link an already-linked Google account, attempt to unlink the only identity.
