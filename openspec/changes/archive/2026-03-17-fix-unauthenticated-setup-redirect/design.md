## Context

In the previous `signup-flow-rework` change, we introduced a `profile_completed` boolean flag in `public.users` to force users to choose a name, emoji, and color after verifying their email or signing in with Google.
Our frontend tracks this via the `profileCompleted` state returned by `useAuth()`. A `useEffect` in `LoginPage.tsx` routes any user whose `profileCompleted` is strictly `false` to the `setup-welcome` screen.
However, because completely unauthenticated (not-logged-in) users have a `user` of `null`, but the API check defaults to failing cleanly (or old local cache might hold a stale `false`), the `user === null` bypasses the first block in the `useEffect`, and then explicitly evaluates `profileCompleted === false`, causing a locked redirect for all unauthenticated traffic.

## Goals / Non-Goals

**Goals:**
- Prevent unauthenticated users (`user === null`) from ever seeing the `setup-welcome` screen.
- Ensure that unauthenticated users always land on the default `welcome` route on the `LoginPage`.
- Fix the logic cleanly without modifying the Supabase database trigger.

**Non-Goals:**
- Modifying the existing "choose name, emoji, color" flow itself.
- Restructuring the global router outside of the `LoginPage` module.

## Decisions

1. **Tighten `LoginPage.tsx` Effect Guard**
   - **Decision**: Update the `useEffect` handling profile redirection in `LoginPage.tsx` so that it immediately returns if `!user`. We will merge the conditions.
   - **Rationale**: The route `/login` should be the starting point for fresh users. If there is no authenticated session (`user === null`), evaluating `profileCompleted` is meaningless. Returning early when `!user` is standard practice.

2. **Tighten `useAuth.ts` Context State**
   - **Decision**: Ensure that `profileCompleted` is immediately forced to `null` whenever `user` is null (e.g., during `onAuthChange` logout events).
   - **Rationale**: This is defensive programming. If a user logs out, their `profileCompleted` boolean shouldn't linger in memory.

## Risks / Trade-offs

- **Risk**: Edge case where `user` loads before `profileCompleted`, causing a brief flash of the `welcome` screen for existing users.
  - **Mitigation**: This is already handled since `profileCompleted` initiates as `null`, which causes the `useEffect` to do nothing (wait) until it resolves to `true` or `false`. Our changes will preserve this loading state.
