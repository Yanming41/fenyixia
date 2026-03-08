## Context

In the newly implemented React SPA rewriting of the Bill Card Carousel, swiping the carousel fast allows multiple cards to be traversed (thanks to the previous fix). However, during this rapid movement, the visual representation of the cards breaks. The cards spread too far out horizontally (disconnecting from the stack) and the cards further out sink too far downwards vertically. 

## Goals / Non-Goals

**Goals:**
- Constrain the maximum horizontal displacement of cards so they appear as a tight overlapping stack even when swiped quickly.
- Constrain the maximum vertical displacement ("sinking") of cards so they don't disappear off the bottom of the screen during fast swipes.

**Non-Goals:**
- Changing the physics model of the drag (already handled).
- Changing the underlying card data structure.

## Decisions

### 1. Clamping the Horizontal Offset
**Decision**: In `getCardStyle`, the input to the horizontal offset `x` calculation is currently `rawV`. We should clamp this or use a non-linear scaling (e.g. logarithmic or a hard maximum) for `absO` (absolute offset).
**Rationale**: By limiting how far a card is horizontally displaced visually, we ensure no "gaps" appear between cards, preserving the illusion of a deck of cards.

### 2. Clamping the Vertical Sinking
**Decision**: The `y` translation is calculated based on `absO`. If `absO` becomes very large (e.g., when swiping fast 4 cards away), `y` grows linearly, pushing the card way down. We must cap the vertical translation.
**Rationale**: Cards should sink slightly as they go backward in the stack, but they must eventually stop sinking once they reach the visual "back" of the stack.

## Risks / Trade-offs

- **Risk**: Clamping values too aggressively might make the carousel feel stiff or unnatural during extreme scrolling.
  - **Mitigation**: We will use a soft limit (e.g. logarithmic decay) or cap it precisely at the 3rd or 4th card depth so standard scrolling looks identical, but boundary edge cases are contained safely.
