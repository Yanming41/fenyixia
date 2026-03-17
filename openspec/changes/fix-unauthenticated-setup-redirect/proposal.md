## Why
Currently, unauthenticated users who visit the application with a stale local session or a transient network state rendering `profileCompleted` to `false` are improperly redirected from the main welcome screen to the "Setup Profile" (`setup-welcome`) step. This prevents them from logging in or signing up normally. We need to tighten the client-side routing logic so that profile completion is *only* enforced for actively authenticated users.

## What Changes
- **Auth Hook Guard**: Update `src/hooks/useAuth.ts` so that `profileCompleted` is explicitly evaluated and exported as `null` or ignored unless a valid `user` object is present in the session.
- **Login Page State Machine Guard**: Update `src/pages/LoginPage.tsx` so the `useEffect` that checks `profileCompleted` and redirects to `setup-welcome` only executes when `user` is strictly truthy. Completely unauthenticated users must remain on the `'welcome'` step.

## Capabilities

### New Capabilities

### Modified Capabilities
- `auth-flow`: Tighten redirect behavior to prevent unauthenticated access to setup steps.

## Impact
- **End Users**: Fixes an infinite loop / dead end blocking new or completely logged-out users from accessing the login or generic welcome forms.
- **Security / Flow Control**: Properly encapsulates the "Profile Setup" mini-flow as an authenticated-only gateway.
