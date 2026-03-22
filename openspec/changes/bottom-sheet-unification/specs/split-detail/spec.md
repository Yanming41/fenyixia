## MODIFIED Requirements

### Requirement: Bill detail view
The split detail page SHALL display the full bill information: icon, title, description, date, total amount, payer, and all line items with their individual member splits. The detail view SHALL use the shared `BottomSheet` component as its container, passing `className="detail-sheet"` for custom styling.

#### Scenario: View bill detail
- **WHEN** user navigates to `/split/:id`
- **THEN** the page displays all bill details inside a `BottomSheet` container with consistent overlay animation and safe-area handling
