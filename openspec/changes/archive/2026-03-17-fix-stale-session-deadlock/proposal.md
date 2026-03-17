## Why

When the app is suspended in a browser tab for a long time, the Supabase session token expires. On page refresh, a race condition occurs: Supabase's `onAuthStateChange` briefly fires with stale user data before the token refresh fails, causing `checkProfileCompleted` to run against an about-to-expire session. If the check returns `false` (network error or user record not found), the app enters the profile setup flow. Then the session fully dies — `updateProfile` fails with "未登录", the user can't complete setup, can't go back to login, and refreshing repeats the deadlock cycle. Robin's earlier fix (resetting to 'welcome' when `user` becomes null) doesn't fully resolve this because the `user`/`profileCompleted` state updates can race against each other.

## What Changes

- **Session validation before setup**: Before entering the profile setup flow, actively verify the session is valid (not just trust cached `user` state).
- **Escape hatch from setup flow**: Add a "退出登录" (sign out) button on all setup steps so users are never permanently stuck.
- **Graceful expired session handling**: When `onAuthStateChange` fires a `TOKEN_REFRESHED` failure or `SIGNED_OUT` event, immediately clear all auth state and redirect to welcome.
- **`checkProfileCompleted` error handling**: If the profile check fails due to network/auth errors, treat it as "unknown" (null) rather than "incomplete" (false), preventing accidental entry into setup flow.

## Capabilities

### New Capabilities

### Modified Capabilities
- `auth-flow`: Fix the session expiry → setup deadlock by adding session validation, error handling in profile check, and escape hatch from setup flow.

## Impact

- **Files**: `src/hooks/useAuth.ts` (AuthProvider), `src/pages/LoginPage.tsx`, `src/lib/api/auth.ts`
- **UX**: Users will no longer get stuck in a dead setup flow after session expiry. They'll be cleanly redirected to the welcome/login screen.
- **No breaking changes**: Normal login/signup/setup flows are unaffected.
