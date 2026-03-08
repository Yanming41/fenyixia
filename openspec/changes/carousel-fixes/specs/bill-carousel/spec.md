## ADDED Requirements

### Requirement: Multi-card swipe gesture
The bill carousel SHALL allow users to swipe through multiple cards in a single gesture. The number of cards traversed SHALL depend on both the drag distance and the drag velocity.

#### Scenario: Fast swipe traverses multiple cards
- **WHEN** a user swipes the carousel with high velocity
- **THEN** the carousel snaps to a card multiple indices away, calculated proportionally to the velocity

#### Scenario: Slow drag traverses cards based on distance
- **WHEN** a user drags the carousel slowly
- **THEN** the carousel snaps to the card nearest to the final drag release position

### Requirement: Carousel physics matching legacy feel
The carousel animations SHALL use spring physics that closely mimic the original transition curves, including a "pop" scale effect when a card becomes active and a slight bounce when settling.

#### Scenario: Card becomes active
- **WHEN** a card settles into the center index position
- **THEN** the card scales up slightly (pop effect) with a spring bounce animation
