## MODIFIED Requirements

### Requirement: Carousel presentation and spacing
The bill carousel SHALL display cards in a stacked, overlapping presentation. The active card is in the front and center, while inactive cards recede backward in scale, fade in opacity, and spread horizontally to the edges.

#### Scenario: High-velocity swipe
- **WHEN** a user swipes the carousel rapidly traversing multiple cards
- **THEN** the cards in motion SHALL NOT visually spread apart enough to expose gaps between them (disconnect)
- **THEN** the cards falling backward in the stack SHALL NOT sink vertically beyond a reasonable maximum depth, remaining visible within the carousel container
