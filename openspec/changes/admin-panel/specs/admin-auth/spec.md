## ADDED Requirements

### Requirement: Admin route accessible only to admin email
The `/admin` route SHALL only be accessible to users logged in with `yiming4144@gmail.com`. Any other user SHALL be redirected to `/`. The admin-ops Edge Function SHALL independently verify the caller's JWT and return 403 if the email does not match.

#### Scenario: Admin accesses /admin
- **WHEN** a user with email `yiming4144@gmail.com` navigates to `/admin`
- **THEN** the admin panel SHALL render

#### Scenario: Non-admin accesses /admin
- **WHEN** any other logged-in user navigates to `/admin`
- **THEN** they SHALL be redirected to `/` immediately

#### Scenario: Unauthenticated user accesses /admin
- **WHEN** an unauthenticated user navigates to `/admin`
- **THEN** they SHALL be redirected to `/`

#### Scenario: Non-admin calls admin-ops Edge Function
- **WHEN** a request arrives at admin-ops with a JWT not belonging to the admin email
- **THEN** the Edge Function SHALL return HTTP 403
