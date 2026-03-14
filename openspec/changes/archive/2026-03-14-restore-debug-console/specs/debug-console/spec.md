## ADDED Requirements

### Requirement: Draggable debug console UI
The application SHALL provide a floating debug console that replicates the layout of the legacy debug panel. It SHALL be draggable and closable.

#### Scenario: Opening and moving the console
- **WHEN** the debug console is visible
- **THEN** the user can drag it around the screen using its top handle
- **THEN** the user can minimize or close it

### Requirement: Real-time parameter inputs
The debug console SHALL contain sliders and toggles corresponding to animation and visual settings.

#### Scenario: Adjusting a slider
- **WHEN** the user drags a slider in the console (e.g., Step distance or Inertia ratio)
- **THEN** the new value is immediately reflected in the console's UI display and the underlying application state
