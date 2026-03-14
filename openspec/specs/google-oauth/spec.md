## ADDED Requirements

### Requirement: google-oauth-sign-in
The app MUST provide a "通过 Google 登录" button on the login welcome screen that initiates Google OAuth sign-in via `supabase.auth.signInWithOAuth({ provider: 'google' })`.

#### Scenario: successful-google-sign-in
- **WHEN** the user clicks "通过 Google 登录" and completes the Google OAuth flow
- **THEN** the user is authenticated and redirected to the home page `/`
- **AND** the auth state updates automatically via the existing `onAuthStateChange` listener

#### Scenario: google-sign-in-cancelled
- **WHEN** the user clicks "通过 Google 登录" but cancels or closes the Google consent screen
- **THEN** the user remains on the login page with no error shown

### Requirement: google-identity-detection
The app MUST detect whether the current authenticated user has a linked Google identity by calling `supabase.auth.getUserIdentities()` and checking if any identity has `provider === 'google'`.

#### Scenario: user-has-google-linked
- **WHEN** the user navigates to the settings page and has a Google identity linked
- **THEN** the UI displays the linked Google email and a "解绑" button

#### Scenario: user-has-no-google-linked
- **WHEN** the user navigates to the settings page and has no Google identity linked
- **THEN** the UI displays a "绑定 Google 账号" button

### Requirement: google-identity-link
The app MUST allow authenticated users to link their Google account by calling `supabase.auth.linkIdentity({ provider: 'google' })`.

#### Scenario: successful-link
- **WHEN** the user clicks "绑定 Google 账号" and completes the Google OAuth flow
- **THEN** the Google identity is linked to their account
- **AND** the settings page shows the linked state upon return

#### Scenario: link-identity-already-taken
- **WHEN** the user attempts to link a Google account that is already linked to a different fenyixia user
- **THEN** the app displays a friendly Chinese error message: "此 Google 账号已被其他用户绑定"

### Requirement: google-identity-unlink
The app MUST allow authenticated users to unlink their Google identity by calling `supabase.auth.unlinkIdentity()` with the Google identity object.

#### Scenario: successful-unlink
- **WHEN** the user clicks "解绑" for their Google account
- **THEN** the Google identity is removed from their account
- **AND** the settings page updates to show the unlinked state

#### Scenario: unlink-last-identity-prevented
- **WHEN** the user attempts to unlink Google and it is their only authentication method (no email+password)
- **THEN** the app prevents the action and displays a warning: "无法解绑，这是你唯一的登录方式"

### Requirement: oauth-error-handling
The app MUST catch errors from Google OAuth operations (sign-in, link, unlink) and display user-friendly Chinese error messages.

#### Scenario: generic-oauth-error
- **WHEN** any Google OAuth operation fails with an unexpected error
- **THEN** the app displays the error in a toast notification with a Chinese description
