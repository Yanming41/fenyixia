## Context

The auth flow uses `AuthProvider` (context) → `ProtectedRoute` (guard) → `LoginPage` (login + setup wizard). The bug is a state machine deadlock caused by a stale Supabase session after long background suspension:

1. Page refresh → Supabase client has expired refresh token in localStorage
2. `onAuthStateChange` fires `INITIAL_SESSION` with stale user data → `user` is briefly set
3. `checkProfileCompleted` runs against the dying session → may return `false` (network/auth error)
4. `LoginPage` useEffect sees `user + profileCompleted===false` → enters setup-welcome
5. Token refresh fails → `user` becomes `null` → Robin's fix resets step to 'welcome'
6. But `profileCompleted` is still `false` from step 3, and if Supabase retries session restoration, the cycle repeats
7. User is stuck: `updateProfile` fails ("未登录"), no way to escape setup, refresh loops back

## Goals / Non-Goals

**Goals:**
- Eliminate the deadlock: users never get permanently stuck in setup flow
- Handle expired sessions gracefully — clean sign out, redirect to welcome
- Keep normal auth flows (login, signup, Google OAuth, setup for genuinely new users) working identically

**Non-Goals:**
- Token refresh optimization (Supabase handles this internally)
- Offline support
- Changing the setup wizard UI design

## Decisions

- **Decision: Add explicit session validation before entering setup flow**
  - **Rationale:** Don't trust cached `user` state alone. Before transitioning to setup-welcome, call `supabase.auth.getUser()` (which hits the server) to confirm the session is actually valid. If it fails, force sign out.

- **Decision: Treat `checkProfileCompleted` errors as "unknown" (null), not "incomplete" (false)**
  - **Rationale:** If the check fails due to network/auth issues, setting `profileCompleted=false` is the root cause of the deadlock. Keeping it as `null` (loading) prevents premature entry into setup flow.

- **Decision: Add sign-out escape button on setup steps**
  - **Rationale:** Even with the above fixes, defensive UX is important. Users should always have a way out. A "退出登录" link on setup-welcome is the minimal change.

- **Decision: Listen for `SIGNED_OUT` event in `onAuthStateChange` to aggressively clear state**
  - **Rationale:** The current handler only checks `session?.user`, but doesn't distinguish between "loading" and "signed out". Explicitly handling `SIGNED_OUT` ensures a clean slate.

## Risks / Trade-offs

- **[Risk] Extra server call on setup entry**
  - **Mitigation:** `getUser()` is only called once when transitioning to setup flow, not on every render. Negligible performance impact.
- **[Trade-off] Slightly more complex auth state logic**
  - Worthwhile to eliminate a user-facing deadlock.
