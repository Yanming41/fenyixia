## ADDED Requirements

### Requirement: Scanner Page Scrollable Area
The system SHALL ensure that the scanner page layout is scrollable when its content exceeds the viewport height on mobile devices and PWAs.

#### Scenario: Content exceeds viewport
- **WHEN** the user views the Scanner page or Quick Bill page and the content height is greater than `100vh`
- **THEN** the system allows vertical scrolling within the scanner page container, ensuring all buttons and form fields are reachable.
