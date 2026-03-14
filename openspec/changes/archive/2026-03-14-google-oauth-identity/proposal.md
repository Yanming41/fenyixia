## Why

The app currently only supports email+PIN authentication. Adding Google OAuth provides a faster login path and lets existing users bind their Google account for one-tap sign-in. With Supabase Google OAuth already configured and manual linking enabled, the frontend is the remaining piece.

## What Changes

1. **Google OAuth Login**: Add a "通过 Google 登录" button on the welcome screen that calls `supabase.auth.signInWithOAuth({ provider: 'google' })`.
2. **Identity Management on Settings Page**: Detect whether the current user has a linked Google identity via `supabase.auth.getUserIdentities()`. Show bind/unbind controls accordingly:
   - Unbound: "绑定 Google 账号" button → `supabase.auth.linkIdentity({ provider: 'google' })`
   - Bound: Display Google email + "解绑" button → `supabase.auth.unlinkIdentity()`
3. **Error Handling**: Catch errors from OAuth sign-in, link, and unlink operations (e.g., identity already linked to another account) and show friendly Chinese error messages via the existing toast system.
4. **Auth API Layer**: Add `signInWithGoogle`, `linkGoogle`, `unlinkGoogle`, and `getGoogleIdentity` helper functions in the auth API module.

## Capabilities

### New Capabilities
- `google-oauth`: Google OAuth sign-in, identity linking/unlinking, and error handling logic.

### Modified Capabilities
- `auth-flow`: Adding Google OAuth as an alternative sign-in method alongside email+PIN.

## Impact

- **UI**: LoginPage welcome step gains a Google sign-in button. SettingsPage gains a Google account binding section.
- **Auth Hook**: `useAuth` context may gain a `signInWithGoogle` method, or Google sign-in can be called directly from the login page.
- **API Layer**: `src/lib/api/auth.ts` gains new OAuth helper functions.
- **Dependencies**: No new packages — uses existing `@supabase/supabase-js` OAuth APIs.
- **Redirect Handling**: OAuth flow redirects back to the app; the existing `onAuthStateChange` listener in `useAuth` will pick up the session automatically.
