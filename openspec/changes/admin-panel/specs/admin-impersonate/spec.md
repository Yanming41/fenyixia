## ADDED Requirements

### Requirement: Admin can log in as any user
The admin SHALL be able to click a "切换登录" button next to any user. The admin-ops Edge Function SHALL generate a one-time magic link for that user's email. The frontend SHALL navigate to the magic link URL, completing the login as that user and landing on the home page.

#### Scenario: Admin impersonates a user
- **WHEN** admin clicks "切换登录" for user X
- **THEN** admin-ops generates a magic link for X's email and returns it
- **THEN** the frontend navigates to the magic link, logging in as X

#### Scenario: Magic link is single-use
- **WHEN** the magic link is used once
- **THEN** it SHALL be invalidated and cannot be reused (Supabase default behavior)
