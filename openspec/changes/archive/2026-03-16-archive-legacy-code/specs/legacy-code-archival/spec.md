## ADDED Requirements

### Requirement: Archive Legacy Vanilla JS Files
The system SHALL have all unused vanilla JS and HTML files removed from the project root and placed in a `legacy/` directory.

#### Scenario: Developer clones the repository
- **WHEN** a developer views the project root
- **THEN** they should not see files like `app.js`, `create-user.html`, or `styles.css`

### Requirement: Archive Unused React Code
The system SHALL have all identified unused React components and API utilities moved to `legacy/components/` and `legacy/lib/` respectively.

#### Scenario: Running codebase analysis
- **WHEN** a developer runs `npx knip`
- **THEN** it should not report `EmailVerificationBanner.tsx`, `Avatar.tsx`, or `reactions.ts` as unused files (since they will be outside the monitored `src/` directory or explicitly ignored/deleted).
