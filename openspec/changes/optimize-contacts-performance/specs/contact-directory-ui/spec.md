## MODIFIED Requirements

### Requirement: WeChat-style Contact List
The main contacts page SHALL display friends grouped alphabetically (A-Z, then #). The grouping and sorting MUST be heavily optimized to prevent UI lag during typing. 

#### Scenario: Viewing contacts list
- **WHEN** the user navigates to the Contacts page
- **THEN** they see friends sorted by Pinyin/Alphabetical order under A-Z headers.
- **THEN** an A-Z quick-jump sidebar is visible on the right edge.
- **THEN** the sorting algorithm MUST NOT recompute pinyin values on every render.

### Requirement: Global Search
The contacts page SHALL feature a global search bar that filters local contacts and searches for new users by email. The local filter MUST support searching by pinyin.

#### Scenario: Searching existing contacts
- **WHEN** the user types an existing friend's name, alias, tag, group, or **the pinyin spelling of their name/alias**
- **THEN** the list instantly filters to show only matching results.

#### Scenario: Sub-second responsiveness
- **WHEN** the user is typing rapidly in the search bar
- **THEN** the UI MUST NOT freeze or drop frames, indicating the pinyin computations have been properly cached.

#### Scenario: Searching for a new user
- **WHEN** the user types a full email address that is not in their contact list
- **THEN** an option appears to search the server for that user to send a friend request.
