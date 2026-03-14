## ADDED Requirements

### Requirement: Dynamic carousel configuration
The bill card carousel SHALL read its physics and animation parameters (step distance, curves, transition durations) from a dynamic source rather than static constants.

#### Scenario: Parameters updated dynamically
- **WHEN** the global debug configuration is changed (e.g., by the debug console)
- **THEN** the carousel immediately uses the new physics and layout calculations on its next interaction or render

### Requirement: Global visual toggles
The application SHALL support toggling global visual effects such as shadows, paper textures, and sheen based on the debug configuration.

#### Scenario: Toggling shadows
- **WHEN** the "Show Shadows" toggle is disabled in the configuration
- **THEN** drop shadows on cards and elements are removed globally
