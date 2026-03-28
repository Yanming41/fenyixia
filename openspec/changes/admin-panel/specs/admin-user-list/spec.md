## ADDED Requirements

### Requirement: Admin can view all registered users
The admin panel SHALL display a list of all registered users fetched via the admin-ops Edge Function. Each user entry SHALL show: emoji, name, email, and registration date.

#### Scenario: User list loads
- **WHEN** the admin opens the panel
- **THEN** a list of all users is fetched and displayed, ordered by registration date descending

#### Scenario: Empty state
- **WHEN** no users are registered
- **THEN** an empty state message SHALL be shown
