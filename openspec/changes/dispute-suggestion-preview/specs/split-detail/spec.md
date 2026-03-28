## MODIFIED Requirements

### Requirement: Dispute details visibility
The SplitDetail view SHALL display dispute details (challenger info, reason, suggested item diff) to ALL bill members when a pending dispute exists, not only to the payer. The payer SHALL additionally see accept/reject action buttons. The challenger SHALL additionally have inline edit capability on the suggested items.

#### Scenario: Dispute details visible to all members
- **WHEN** any bill member opens a bill with a pending dispute
- **THEN** the dispute details section SHALL be expanded and visible by default

#### Scenario: Payer sees action buttons
- **WHEN** the payer views dispute details
- **THEN** accept and reject buttons SHALL be displayed below the diff

#### Scenario: Challenger sees edit controls
- **WHEN** the challenger views dispute details
- **THEN** member chips on suggested items SHALL be interactive for editing
