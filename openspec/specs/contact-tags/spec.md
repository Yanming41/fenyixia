## ADDED Requirements

### Requirement: Tag Management
Users SHALL be able to create custom private tags and assign them to friends.

#### Scenario: Creating and viewing tags
- **WHEN** a user navigates to the "标签" (Tags) page
- **THEN** they can create a new tag, edit its name/color, and see all existing tags.

#### Scenario: Assigning tags to a friend
- **WHEN** a user opens a friend's profile card
- **THEN** they can assign or remove multiple custom tags for that specific friend.

### Requirement: Resolve friends by tag
The tags API SHALL provide a function to resolve all friends associated with a given tag, returning their user IDs and basic profile information (name, emoji, color).

#### Scenario: Bill picker resolves tag members
- **WHEN** the bill member picker selects a tag
- **THEN** it calls `getFriendsByTag(tagId)` to resolve all friends with that tag into `Member[]` objects for batch selection.
