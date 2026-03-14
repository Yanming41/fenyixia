## MODIFIED Requirements

### Requirement: Login page
The app SHALL provide a login page at `/login` where users can sign in via email+PIN or via Google OAuth. The welcome screen MUST display both "登录" (email+PIN) and "通过 Google 登录" (OAuth) options.

#### Scenario: Successful login
- **WHEN** user enters valid email and PIN
- **THEN** they are authenticated and redirected to `/`

#### Scenario: Failed login
- **WHEN** user enters invalid credentials
- **THEN** an error message is displayed

#### Scenario: Google OAuth login
- **WHEN** user clicks "通过 Google 登录" on the welcome screen
- **THEN** the Google OAuth flow is initiated via Supabase
