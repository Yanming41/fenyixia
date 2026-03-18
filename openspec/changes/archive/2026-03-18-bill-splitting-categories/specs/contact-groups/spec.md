## MODIFIED Requirements

### Requirement: Group member resolution for external consumers
Groups SHALL expose their `members: Member[]` array such that external components (e.g., bill member picker) can read all member user IDs and metadata without additional API calls.

#### Scenario: Bill picker reads group members
- **WHEN** the bill member picker selects a group
- **THEN** it reads the group's pre-fetched `members` array to obtain all user IDs for batch selection.
