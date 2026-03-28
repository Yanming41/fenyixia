## ADDED Requirements

### Requirement: All bill members can view dispute suggestion diff
When a bill has a pending dispute, ALL members associated with the bill (payer, challenger, other members) SHALL be able to view the suggested_items modification in the SplitDetail view. The diff SHALL display original item assignments compared to the suggested assignments, showing added/removed members per item.

#### Scenario: Payer views dispute suggestion
- **WHEN** the payer opens a bill with a pending dispute
- **THEN** the dispute details section SHALL be visible, showing the challenger's reason, the suggested item diff, and accept/reject buttons

#### Scenario: Challenger views their own dispute suggestion
- **WHEN** the challenger opens the bill they disputed
- **THEN** the dispute details section SHALL be visible, showing their reason and the suggested item diff (without accept/reject buttons)

#### Scenario: Other member views dispute suggestion
- **WHEN** a non-payer, non-challenger member opens a bill with a pending dispute
- **THEN** the dispute details section SHALL be visible in read-only mode, showing the challenger's reason and the suggested item diff

#### Scenario: No dispute on bill
- **WHEN** a member opens a bill without a pending dispute
- **THEN** no dispute details section SHALL be displayed
