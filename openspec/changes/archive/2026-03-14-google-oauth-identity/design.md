## Context

The fenyixia app uses Supabase Auth with email+PIN (password) sign-in. The Supabase project already has Google OAuth configured with "Allow manual linking" enabled. The frontend auth layer consists of:
- `src/lib/api/auth.ts` — low-level Supabase auth calls
- `src/hooks/useAuth.ts` — AuthContext provider exposing `user`, `signIn`, `signUp`, `signOut`
- `src/pages/LoginPage.tsx` — multi-step login/signup wizard
- `src/pages/SettingsPage.tsx` — profile display + sign-out

The `onAuthStateChange` listener in `useAuth` already handles session updates, so after an OAuth redirect the user state will update automatically.

## Goals / Non-Goals

**Goals:**
- Add Google OAuth as a sign-in option on the login welcome screen
- Let authenticated users link/unlink their Google identity from Settings
- Provide clear Chinese error messages for common OAuth failures
- Keep implementation minimal — no new packages, no schema changes

**Non-Goals:**
- Supporting other OAuth providers (Apple, GitHub, etc.) — only Google for now
- Auto-linking accounts by email — using Supabase's manual linking mode
- Changing the existing email+PIN flow in any way
- Adding a dedicated profile/account management page — use existing SettingsPage

## Decisions

### 1. OAuth Helper Functions in auth.ts
**Decision:** Add `signInWithGoogle()`, `linkGoogle()`, `unlinkGoogle()`, and `getGoogleIdentity()` as standalone functions in `src/lib/api/auth.ts`.
**Rationale:** Follows the existing pattern — `signIn`, `signUp`, `signOut` are all standalone functions in this file. No need to change the AuthContext interface for Google-specific operations since they're only used in specific pages.
**Alternative:** Add `signInWithGoogle` to the AuthContext. Rejected — it would bloat the context for something only used on the login page. Pages can import directly from the API module.

### 2. useGoogleIdentity Custom Hook
**Decision:** Create a `useGoogleIdentity()` hook that encapsulates fetching the current Google identity state, linking, and unlinking.
**Rationale:** The SettingsPage needs to check identity status on mount and react to link/unlink actions. A hook cleanly encapsulates this lifecycle. Returns `{ googleIdentity, loading, error, link, unlink }`.
**Alternative:** Inline the logic in SettingsPage. Rejected — the identity check + link/unlink logic is self-contained and benefits from encapsulation.

### 3. Google Button Placement on LoginPage
**Decision:** Add a Google sign-in button on the `welcome` step, between the existing "登录" and "注册新账号" buttons, with a visual separator ("或").
**Rationale:** The welcome screen is the natural entry point. Placing Google between email login and signup makes it a clear alternative without disrupting the existing flow.

### 4. Identity Section in SettingsPage
**Decision:** Add a "账号绑定" (Account Linking) section in SettingsPage between the profile card and sign-out button.
**Rationale:** SettingsPage already shows user profile info and is the natural place for account management. A new section keeps it organized.

### 5. Error Handling Strategy
**Decision:** Use the existing toast system (`useToast`) for OAuth errors, with Chinese messages mapped from common Supabase error codes.
**Rationale:** Consistent with the app's existing error UX. OAuth errors happen asynchronously (redirect-based), so toasts are more appropriate than inline errors.

### 6. OAuth Redirect URL
**Decision:** Use `${window.location.origin}/` as the redirect URL for OAuth, letting the `onAuthStateChange` handler in AuthProvider pick up the session.
**Rationale:** After OAuth redirect, the user lands on the home page already authenticated. No special callback route needed — the existing auth listener handles it.

## Risks / Trade-offs

- **Risk:** OAuth redirect loses app state (e.g., user was on settings page when linking).
  → **Mitigation:** For linking, use `redirectTo` pointing to `/settings` so the user returns to settings after linking.

- **Risk:** `unlinkIdentity` fails if it's the user's only identity (can't unlink the last one).
  → **Mitigation:** Check if user has a password-based identity before allowing unlink. If email+PIN is their only other method, warn them before unlinking.

- **Risk:** Google account already linked to a different fenyixia user.
  → **Mitigation:** Supabase returns a specific error for this. Map it to a friendly Chinese message: "此 Google 账号已被其他用户绑定".
