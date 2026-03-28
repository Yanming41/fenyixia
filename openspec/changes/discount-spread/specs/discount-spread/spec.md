## ADDED Requirements

### Requirement: Negative item shows spread toggle
Each item row with a negative price SHALL display a "分摊到商品" toggle button. The toggle SHALL be disabled when no other positive-price items exist in the bill.

#### Scenario: Toggle appears on negative item
- **WHEN** an item's price is negative (or the user types a negative value)
- **THEN** a "分摊到商品" toggle SHALL appear on that item row

#### Scenario: Toggle disabled with no positive items
- **WHEN** all other items also have negative prices
- **THEN** the toggle SHALL be disabled and non-interactive

### Requirement: Preview adjusted prices on positive items
When a negative item's spread toggle is ON, each positive-price item SHALL display its adjusted price (after discount is applied proportionally) as a read-only preview label next to the price input. The original price input value SHALL remain unchanged.

#### Scenario: Preview label shown
- **WHEN** at least one negative item has spreadDiscount = true
- **THEN** each positive item row SHALL show "→ ¥<adjusted>" label

#### Scenario: Preview disappears when toggled off
- **WHEN** the spread toggle is turned off
- **THEN** the preview label on positive items SHALL disappear

### Requirement: Proportional discount spread on save
When saving the bill, any negative item with spreadDiscount = true SHALL have its total discount distributed proportionally across all positive items (by their share of the positive total). The negative item itself SHALL be excluded from the saved payload.

#### Scenario: Single discount item spread across two positive items
- **WHEN** items are [A ¥100, B ¥200, 优惠 -¥30] and 优惠 has spreadDiscount = true
- **THEN** saved items are [A ¥90 (−10), B ¥180 (−20)] with 优惠 omitted

#### Scenario: Unspread negative item saves as-is
- **WHEN** a negative item has spreadDiscount = false (or unset)
- **THEN** it saves to the bill exactly like any other item

#### Scenario: Multiple spread discounts
- **WHEN** two negative items both have spreadDiscount = true
- **THEN** each is spread independently in sequence, both excluded from saved payload

### Requirement: Spread calculation precision
Adjusted prices SHALL be rounded to two decimal places to avoid floating-point artifacts in the saved bill.

#### Scenario: Rounding applied
- **WHEN** a proportional spread produces a repeating decimal
- **THEN** the saved price SHALL be rounded to 2 decimal places
