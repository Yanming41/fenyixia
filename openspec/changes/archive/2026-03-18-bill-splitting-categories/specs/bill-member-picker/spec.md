## ADDED Requirements

### Requirement: Member picker with group shortcut
The bill creation/editing flow SHALL provide a "Groups" section displaying horizontally scrollable group chips. Selecting a group chip SHALL batch-add all of its members to the selected members set. Groups may contain users who are not in the current user's friend list.

#### Scenario: Selecting a group
- **WHEN** user taps a group chip in the picker
- **THEN** all members of that group are added to the selected set and appear in the bubble bar.

#### Scenario: Deselecting individual from group
- **WHEN** user deselects an individual member who was added via a group
- **THEN** that member is removed from the selected set; the group chip loses its "active" highlight.

#### Scenario: Creating a group inline
- **WHEN** user taps "＋ 新群组" in the groups section
- **THEN** a dialog appears allowing the user to name the group and select members
- **AND** after saving, the group is created and automatically selected.

### Requirement: Member picker with tag shortcut
The bill creation/editing flow SHALL provide a "Tags" section displaying horizontally scrollable tag chips. Selecting a tag chip SHALL batch-add all friends with that tag to the selected set.

#### Scenario: Selecting a tag
- **WHEN** user taps a tag chip in the picker
- **THEN** all friends with that tag are resolved and added to the selected set.

#### Scenario: Creating a tag inline
- **WHEN** user taps "＋ 新标签" in the tags section
- **THEN** a dialog appears allowing the user to name and color the tag
- **AND** after saving, the tag is created (no members auto-selected since it is new).

### Requirement: Member picker with A-Z friend list
The bill creation/editing flow SHALL provide a "Friends" section displaying friends sorted A-Z by pinyin with section headers. Each friend entry SHALL have a checkbox. A search bar SHALL filter friends by name, alias, or pinyin.

#### Scenario: Browsing and selecting friends
- **WHEN** user scrolls through the A-Z friend list
- **THEN** they can tap individual friends to toggle selection.

#### Scenario: Searching for a friend
- **WHEN** user types in the search bar
- **THEN** the friend list is filtered to match name, alias, or pinyin sort key.

### Requirement: Selected members bubble bar
The picker SHALL display a horizontally scrollable bar showing all currently selected members. Each bubble SHALL show the member's emoji and name, with a ✕ button for removal.

#### Scenario: Removing a member from bubble bar
- **WHEN** user taps ✕ on a member bubble
- **THEN** that member is removed from the selected set and the bubble disappears.

#### Scenario: Bubble bar with non-friend members
- **WHEN** a selected member is not in the user's friend list (added via a group)
- **THEN** the member still appears in the bubble bar with their name and emoji from the group's member data.

### Requirement: Personalization placeholder
The picker SHALL reserve a hidden insertion point for a future personalization module (e.g., last-used group, frequent contacts). This placeholder SHALL NOT be visible to users in this version.

#### Scenario: Placeholder existence
- **WHEN** the picker is rendered
- **THEN** a commented-out or conditionally hidden slot exists in the component for future personalization content.
