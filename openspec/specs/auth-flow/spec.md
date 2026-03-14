## ADDED Requirements

### Requirement: Login page
The app SHALL provide a login page at `/login` where users enter email and PIN (password) to sign in via Supabase auth.

#### Scenario: Successful login
- **WHEN** user enters valid email and PIN
- **THEN** they are authenticated and redirected to `/`

#### Scenario: Failed login
- **WHEN** user enters invalid credentials
- **THEN** an error message is displayed

### Requirement: Signup page
The app SHALL provide a signup page at `/signup` where users enter email, PIN, name, emoji, and color to create an account.

#### Scenario: Successful signup
- **WHEN** user fills in all fields and submits
- **THEN** a Supabase auth account is created and a `users` table record is inserted with name, emoji, and color

### Requirement: Auth state management
The app SHALL use a React context (`AuthContext`) to provide the current user throughout the component tree. Auth state changes SHALL be listened to via `onAuthChange`.

#### Scenario: Auth state propagation
- **WHEN** a user logs in or out
- **THEN** all components consuming `AuthContext` re-render with the updated user state

### Requirement: Protected routes
Routes `/` and `/split/:id` SHALL be protected. Unauthenticated users SHALL be redirected to `/login`.

#### Scenario: Access protected route while logged out
- **WHEN** an unauthenticated user visits `/`
- **THEN** they are redirected to `/login`
