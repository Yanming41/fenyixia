## ADDED Requirements

### Requirement: Bill detail view
The split detail page SHALL display the full bill information: icon, title, description, date, total amount, payer, and all line items with their individual member splits.

#### Scenario: View bill detail
- **WHEN** user navigates to `/split/:id`
- **THEN** the page displays all bill details including items and per-member breakdown

### Requirement: Payment status tracking
For each member in the bill, the view SHALL show their payment status: paid (with proof) or pending. The payer's view SHALL show who has paid and who hasn't.

#### Scenario: Payer views payment status
- **WHEN** the bill payer views the split detail
- **THEN** they see each member's payment status (paid/pending) and any uploaded payment proofs

### Requirement: Payment proof upload
Members (non-payers) SHALL be able to upload payment proof images. The upload SHALL use Supabase storage and create a `payment_proofs` record.

#### Scenario: Upload payment proof
- **WHEN** a member uploads a payment proof image
- **THEN** the image is stored and the member's status updates to show the proof

### Requirement: Anger/protest system
Members SHALL be able to send "anger" reactions on bills where they owe money. The payer SHALL see unseen anger notifications.

#### Scenario: Send anger
- **WHEN** a member taps the anger button on a bill
- **THEN** the anger count increments and the payer receives an unseen anger notification

### Requirement: Bill editing
The payer SHALL be able to edit bill details: title, icon, description, and line items (name, price, quantity, assigned members).

#### Scenario: Edit bill items
- **WHEN** the payer edits a bill's items and saves
- **THEN** the old items are replaced with the new items and member assignments

### Requirement: Bill settled toggle
The payer SHALL be able to mark a bill as settled or unsettle it.

#### Scenario: Mark bill settled
- **WHEN** the payer toggles the settled status
- **THEN** the bill's `settled` field updates and the UI reflects the new status
