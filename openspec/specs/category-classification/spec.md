## ADDED Requirements

### Requirement: derive-category-from-bill-icon
The application MUST derive a primary functional category for each bill based on its associated `icon` (emoji).

#### Scenario: classifying-a-food-bill
- **WHEN** a bill has an icon like 🍔, 🍕, or ☕
- **THEN** the bill is classified under the "餐饮" (Food/Dining) category for statistical aggregation

### Requirement: fallback-category
The application MUST provide a fallback category for bills whose `icon` does not match any predefined category mapping.

#### Scenario: unmapped-emoji
- **WHEN** a bill uses a rare or unmapped emoji (e.g., 🦄)
- **THEN** it is classified under the "其他" (Other) category

### Requirement: stable-mapping-reference
The application MUST maintain a stable, centralized configuration object mapping common emojis to their respective category labels.

#### Scenario: updating-categories
- **WHEN** a new emoji needs to be added to the Transport category
- **THEN** adding it to the centralized map automatically unifies past and future bills using that emoji under "Transport" in all statistical views
