## 1. Auth Context Hardening

- [x] 1.1 In `AuthProvider`, make `checkProfileCompleted` catch errors and keep `profileCompleted` as `null` (not `false`) on failure
- [x] 1.2 In `onAuthStateChange`, handle `SIGNED_OUT` event explicitly to clear both `user` and `profileCompleted` to null
- [x] 1.3 In `onAuthStateChange`, when user transitions from non-null to null, also reset `profileCompleted` to null

## 2. LoginPage Session Validation

- [x] 2.1 Before entering `setup-welcome` step, call `supabase.auth.getUser()` to verify session is valid; if invalid, call `signOut()` and stay on `welcome`
- [x] 2.2 Add "退出登录" button on `setup-welcome` step that calls `signOut()` and resets to `welcome`
- [x] 2.3 Add "退出登录" button on `setup-name` and `setup-emoji` steps as fallback escape

## 3. Verification

- [x] 3.1 Build succeeds with no TypeScript errors
- [x] 3.2 Manual test: normal login → setup flow still works for genuine new users
- [x] 3.3 Manual test: simulate expired session → user lands on welcome, not stuck in setup
