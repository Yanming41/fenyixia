## ADDED Requirements

### Requirement: Persistent bottom navigation
The application shell SHALL display a persistent bottom navigation bar across all main views (excluding full-screen modals like the split detail sheet).

#### Scenario: Viewing the home page
- **WHEN** the user is on the main home page
- **THEN** the bottom navigation bar is visible at the bottom of the screen

### Requirement: Main navigation actions
The bottom navigation bar SHALL contain tabs for primary app areas and a prominent "Add Bill" floating action button in the center.

#### Scenario: Add bill intent
- **WHEN** the user taps the central "+" button in the bottom navigation
- **THEN** an action to create a new bill is triggered

### Requirement: Non-overlapping layout
The main application content (like the bill carousel) SHALL NOT be obscured by the bottom navigation bar.

#### Scenario: Scrolling content to the bottom
- **WHEN** the user views the carousel and summary cards
- **THEN** the content is padded at the bottom so it can be fully scrolled above the navigation bar's safe area
