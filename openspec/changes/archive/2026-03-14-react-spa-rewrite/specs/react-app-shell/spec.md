## ADDED Requirements

### Requirement: Vite project scaffolding
The project SHALL use Vite with React and TypeScript plugins. It SHALL include `package.json`, `tsconfig.json`, `vite.config.ts`, and `index.html` as entry point.

#### Scenario: Dev server starts
- **WHEN** developer runs `npm run dev`
- **THEN** Vite dev server starts and serves the React app at localhost

#### Scenario: Production build
- **WHEN** developer runs `npm run build`
- **THEN** Vite produces optimized output in `dist/` directory

### Requirement: SPA routing
The app SHALL use `react-router-dom` with the following routes: `/` (bill carousel), `/split/:id` (split detail), `/login` (login page), `/signup` (signup page).

#### Scenario: Navigate to bill detail
- **WHEN** user taps a bill card in the carousel
- **THEN** app navigates to `/split/:id` showing the split detail view for that bill

#### Scenario: Unauthenticated redirect
- **WHEN** an unauthenticated user visits `/` or `/split/:id`
- **THEN** they SHALL be redirected to `/login`

### Requirement: App layout
The app SHALL render a header with the app title "分一下" and current user's avatar/name. The header style SHALL match the existing iOS-style navigation bar.

#### Scenario: Header displays user info
- **WHEN** a logged-in user views any page
- **THEN** the header shows their emoji avatar, name, and the app title
