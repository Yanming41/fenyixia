## ADDED Requirements

### Requirement: Instant page re-mount with cached data
When a user navigates away from a page and returns, the page SHALL display previously loaded data immediately without showing a loading state.

#### Scenario: Switching from HomePage to ContactsPage and back
- **WHEN** user views HomePage (bills loaded), switches to ContactsPage, then switches back to HomePage
- **THEN** HomePage SHALL display cached bills instantly without "加载中..." and silently revalidate in the background

#### Scenario: Switching to ContactsPage after initial load
- **WHEN** user has previously visited ContactsPage (friends loaded), then navigates away and returns
- **THEN** ContactsPage SHALL display cached friends list with A-Z index instantly

### Requirement: Background revalidation
After serving cached data, the system SHALL silently revalidate by re-fetching from Supabase in the background and updating the UI if data has changed.

#### Scenario: Data changed while on another page
- **WHEN** user returns to a page and the underlying data has changed since last fetch
- **THEN** the page SHALL first show cached (stale) data, then seamlessly update to reflect fresh data without a full loading state

### Requirement: Cache invalidation after mutations
After any create, update, or delete operation, the system SHALL invalidate the relevant cache key so the next render shows fresh data.

#### Scenario: Creating a new bill
- **WHEN** user creates a new bill via AddBillOverlay
- **THEN** the bills cache SHALL be invalidated and revalidated, and the new bill appears when navigating to HomePage

#### Scenario: Accepting a friend request
- **WHEN** user accepts a friend request on NewFriendsPage
- **THEN** the friends cache and received-requests cache SHALL be invalidated, and the new friend appears on ContactsPage

### Requirement: Request deduplication
The system SHALL deduplicate identical in-flight requests so that multiple components using the same cache key do not trigger multiple simultaneous fetches.

#### Scenario: Multiple components requesting bills
- **WHEN** two components both use the bills SWR hook simultaneously
- **THEN** only one network request SHALL be made to Supabase

### Requirement: Global SWR configuration
The app SHALL provide a global SWR configuration at the root level with revalidateOnFocus and deduplication defaults.

#### Scenario: App initialization
- **WHEN** the app mounts
- **THEN** an SWRConfig provider SHALL wrap all routes with default settings for revalidateOnFocus and dedupingInterval
