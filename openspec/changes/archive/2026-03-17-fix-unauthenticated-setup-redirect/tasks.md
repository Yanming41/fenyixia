## 1. Auth Hook Guard

- [x] 1.1 Update `src/hooks/useAuth.ts` to explicitly set `profileCompleted` to `null` instead of running `checkProfileCompleted` when `user` is falsy in the `onAuthChange` listener.

## 2. Login Page Routing Guard

- [x] 2.1 Update the `useEffect` handling profile redirection in `src/pages/LoginPage.tsx` (around line 38) to `return` immediately if `!user`.
- [x] 2.2 Ensure the fallback logic does not trigger `setStep('setup-welcome')` on unauthenticated clients.
