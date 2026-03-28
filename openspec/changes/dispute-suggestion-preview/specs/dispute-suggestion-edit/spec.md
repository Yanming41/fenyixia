## ADDED Requirements

### Requirement: Challenger can edit suggested items
The challenger SHALL be able to edit the suggested_items of their pending dispute directly in the SplitDetail diff view. Editing SHALL allow toggling member assignments per item. Changes SHALL be saved via an updateDispute API call.

#### Scenario: Challenger edits member assignment
- **WHEN** the challenger views their pending dispute diff and taps a member chip on a suggested item
- **THEN** the member SHALL be toggled on/off for that item, and the updated suggested_items SHALL be saved to the database

#### Scenario: Challenger cannot remove all members from an item
- **WHEN** the challenger attempts to remove the last member from a suggested item
- **THEN** the system SHALL prevent the removal, keeping at least one member per item

#### Scenario: Non-challenger cannot edit
- **WHEN** a non-challenger member views the dispute diff
- **THEN** member chips SHALL NOT be interactive and no edit controls SHALL be displayed

### Requirement: updateDispute API
The system SHALL provide an updateDispute function that updates the suggested_items field of a pending dispute. Only the challenger of the dispute SHALL be allowed to perform this update (enforced by RLS).

#### Scenario: Challenger updates suggested items
- **WHEN** the challenger calls updateDispute with new suggested_items
- **THEN** the bill_disputes row SHALL be updated with the new suggested_items

#### Scenario: Non-challenger update rejected
- **WHEN** a non-challenger user attempts to call updateDispute
- **THEN** the update SHALL be rejected by RLS policy
