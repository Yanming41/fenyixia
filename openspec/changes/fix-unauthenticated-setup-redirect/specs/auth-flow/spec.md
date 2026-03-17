## MODIFIED Requirements

### Requirement: Protected routes
Routes `/` and `/split/:id` SHALL be protected. Unauthenticated users SHALL be redirected to `/login`, and they MUST remain on the initial welcome interface until an authentication action is initiated. They SHALL NOT be redirected to profile setup or other authenticated-only flows.

#### Scenario: Access protected route while logged out
- **WHEN** an unauthenticated user visits `/`
- **THEN** they are redirected to `/login`
- **AND** they see the initial welcome screen with login and signup options.

#### Scenario: Unauthenticated user visits login directly
- **WHEN** an unauthenticated user visits `/login` directly
- **THEN** they see the initial welcome screen with login and signup options.
- **AND** they are NOT redirected to the profile setup flow, regardless of any cached profile state.
