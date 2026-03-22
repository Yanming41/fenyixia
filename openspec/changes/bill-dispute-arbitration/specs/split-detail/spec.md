## ADDED Requirements

### Requirement: Dispute entry point for members
The split detail page SHALL display a "⚖️ 质疑" button for non-payer members on unsettled bills with no pending dispute, alongside the existing anger button.

#### Scenario: Member sees dispute button
- **WHEN** a non-payer member views an unsettled bill with no pending dispute
- **THEN** the page displays a "⚖️ 质疑" button in the action area

#### Scenario: Member on settled bill
- **WHEN** a member views a settled bill
- **THEN** the "⚖️ 质疑" button SHALL NOT be displayed

### Requirement: Dispute status banner
The split detail page SHALL display a prominent "裁决中" banner when the bill has a pending dispute, visible to both payer and members.

#### Scenario: Bill with pending dispute
- **WHEN** any user views a bill with a pending dispute
- **THEN** a "裁决中" banner SHALL be displayed below the role banner, showing the challenger's name and a brief summary

### Requirement: Payer dispute review UI
When the payer views a bill with a pending dispute, the split detail page SHALL show the dispute details inline: the challenger's reason, a comparison of current vs suggested member assignments, and accept/reject buttons.

#### Scenario: Payer reviews dispute
- **WHEN** the payer views a bill with a pending dispute and taps the dispute banner
- **THEN** the page expands to show the challenger's reason, the suggested changes (highlighting differences from current assignments), and "接受修改" / "拒绝" action buttons

## MODIFIED Requirements

### Requirement: Anger/protest system
Members SHALL be able to send "anger" reactions on bills where they owe money. The payer SHALL see unseen anger notifications. When a bill has a pending dispute, the anger button SHALL remain functional independently of the dispute system.

#### Scenario: Send anger
- **WHEN** a member taps the anger button on a bill
- **THEN** the anger count increments and the payer receives an unseen anger notification

#### Scenario: Anger coexists with dispute
- **WHEN** a bill has a pending dispute
- **THEN** the anger button SHALL still be available and functional
