## ADDED Requirements

### Requirement: Group Creation and Listing
Users SHALL be able to create public chat/bill groups and view them in a dedicated list.

#### Scenario: Creating a group
- **WHEN** a user clicks "Create Group" on the Groups page and selects multiple friends
- **THEN** a new group is created and all selected friends are added as members.

#### Scenario: Viewing groups
- **WHEN** a user navigates to the "群聊" (Groups) page
- **THEN** they see a list of all groups they are a member of.

### Requirement: Group member resolution for external consumers
Groups SHALL expose their `members: Member[]` array such that external components (e.g., bill member picker) can read all member user IDs and metadata without additional API calls.

#### Scenario: Bill picker reads group members
- **WHEN** the bill member picker selects a group
- **THEN** it reads the group's pre-fetched `members` array to obtain all user IDs for batch selection.
