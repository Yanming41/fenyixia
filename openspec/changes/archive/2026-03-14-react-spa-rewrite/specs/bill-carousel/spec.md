## ADDED Requirements

### Requirement: Card carousel display
The carousel SHALL display bill cards in a horizontal stack with the active card centered and scaled to 1.0. Adjacent cards SHALL be progressively scaled down (0.13 per position), offset vertically (14px per position), and reduced in opacity (0.26 per position).

#### Scenario: Initial render
- **WHEN** the carousel loads with bills data
- **THEN** the first bill card is centered at full scale, with adjacent cards stacked behind with decreasing scale/opacity

### Requirement: Swipe navigation
Users SHALL swipe left/right to navigate between cards. A drag threshold of 72px SHALL trigger card change. The carousel SHALL support inertia-based scrolling where swipe velocity determines animation duration.

#### Scenario: Swipe to next card
- **WHEN** user swipes left more than 72px
- **THEN** the carousel animates to the next card with inertia physics

#### Scenario: Swipe below threshold
- **WHEN** user swipes left less than 72px and releases
- **THEN** the carousel snaps back to the current card

### Requirement: Card bounce effect
When a card becomes active, it SHALL play a "pop" animation scaling to 1.08x then back to 1.0x over 280ms.

#### Scenario: Card selection bounce
- **WHEN** a card becomes the active center card after swipe
- **THEN** it briefly scales to 1.08x and bounces back to 1.0x

### Requirement: Card content display
Each card SHALL display: icon, title, description, total amount, date, payer info, member avatars, per-person amount, and settled status.

#### Scenario: Settled bill display
- **WHEN** a bill is marked as settled
- **THEN** the card shows a "已结清" (settled) indicator

### Requirement: Card tap to detail
Users SHALL tap any visible card to open its detail view. Tapping the center card navigates to split detail. Tapping a side card first scrolls it to center.

#### Scenario: Tap center card
- **WHEN** user taps the center card
- **THEN** app navigates to the split detail view for that bill

#### Scenario: Tap side card
- **WHEN** user taps a non-center card
- **THEN** the carousel scrolls to center that card

### Requirement: Summary section
Above the carousel, a summary section SHALL display 4 values: collected amount, pending collection, paid amount, and pending payment, calculated from the current user's bills.

#### Scenario: Summary calculation
- **WHEN** bills are loaded
- **THEN** the summary shows correct totals for collected/pending amounts based on payer role and payment proofs
