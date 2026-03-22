## ADDED Requirements

### Requirement: Member can initiate a dispute on a bill
The system SHALL allow a non-payer member to initiate a dispute on an unsettled bill by providing a textual reason (辩词). The system SHALL prevent initiating a dispute if the bill is already settled or if there is already a pending dispute on the same bill.

#### Scenario: Successfully initiate a dispute
- **WHEN** a non-payer member views an unsettled bill with no pending dispute and taps the "质疑" button
- **THEN** the system SHALL display a DisputeSheet with a text input for the dispute reason

#### Scenario: Cannot dispute a settled bill
- **WHEN** a member views a settled bill
- **THEN** the "质疑" button SHALL NOT be displayed

#### Scenario: Cannot dispute when another dispute is pending
- **WHEN** a member views a bill that already has a pending dispute
- **THEN** the "质疑" button SHALL be disabled or hidden, and a "裁决中" status SHALL be shown

### Requirement: AI generates a suggested resolution from dispute reason
The system SHALL send the original bill data (items, members, amounts) and the challenger's reason to the AI via the scan-receipt Edge Function. The AI SHALL return a modified items array with adjusted member assignments. The system SHALL NOT allow AI to change item prices or quantities, only member assignments.

#### Scenario: AI produces a valid resolution
- **WHEN** the challenger submits their dispute reason
- **THEN** the system SHALL call the AI with a prompt containing the original bill items and the dispute reason, and display the AI-suggested new member assignments to the challenger

#### Scenario: AI call fails
- **WHEN** the AI API call fails or returns invalid data
- **THEN** the system SHALL show an error message and allow the challenger to retry or edit their reason

### Requirement: Challenger can edit the AI suggestion before submitting
The system SHALL display the AI-generated suggestion in an editable form, allowing the challenger to adjust member assignments before finalizing the dispute submission.

#### Scenario: Challenger edits and submits
- **WHEN** the challenger receives the AI suggestion
- **THEN** the system SHALL display each item with its suggested member assignments, allow the challenger to toggle members on/off for each item, and submit the final version

#### Scenario: Challenger cancels
- **WHEN** the challenger decides not to proceed after seeing the AI suggestion
- **THEN** the system SHALL discard the dispute and return to the bill detail view without creating any record

### Requirement: Dispute record is persisted
The system SHALL store the dispute in a `bill_disputes` table with: bill_id, challenger_id, reason, suggested_items (jsonb), and status (pending/accepted/rejected).

#### Scenario: Dispute saved successfully
- **WHEN** the challenger confirms and submits the edited suggestion
- **THEN** the system SHALL insert a record into `bill_disputes` with status='pending' and the suggested_items containing the full adjusted items+members data

### Requirement: Payer can review and resolve a dispute
The system SHALL allow the bill payer to view the dispute details (challenger name, reason, suggested changes) and either accept or reject the dispute.

#### Scenario: Payer accepts the dispute
- **WHEN** the payer views the pending dispute and taps "接受"
- **THEN** the system SHALL update the bill's items and member assignments to match the dispute's suggested_items, set the dispute status to 'accepted', and show a success confirmation

#### Scenario: Payer rejects the dispute
- **WHEN** the payer views the pending dispute and taps "拒绝"
- **THEN** the system SHALL set the dispute status to 'rejected' without modifying the bill, and show a confirmation

### Requirement: Dispute status is visible in bill listings
The system SHALL display a visual indicator on bills that have a pending dispute, distinguishable from normal bills in the bill list/carousel.

#### Scenario: Bill with pending dispute in list
- **WHEN** a user views the bill list and a bill has a pending dispute
- **THEN** the bill card SHALL display a "裁决中" badge or indicator
