## 1. Core Data & Logic

- [x] 1.1 Create `EMOJI_TO_CATEGORY_MAP` constant in `src/lib/constants.ts` (or similar) to handle the icon-to-category mapping.
- [x] 1.2 Implement the `useBillStats` hook in `src/hooks/useBillStats.ts` to aggregate expenses and incomes by category, participant, and date.
- [x] 1.3 Write unit tests (if applicable/existing testing setup allows) or manually verify `useBillStats` logic with mock data.

## 2. Shared Components (UI)

- [x] 2.1 Build the `DateRangePicker` component (custom UI supporting month/day selection) in `src/components/Statistics/`.
- [x] 2.2 Build the `IncomeExpenseToggle` component.
- [x] 2.3 Build the base `PieChart` component (using SVG or CSS, adhering to debug visual toggles).
- [x] 2.4 Build the base `BarChart` component for trends.
- [x] 2.5 Build the `LegendBar` component to display detailed breakdowns below pie charts.

## 3. Statistics Page Assembly

- [x] 3.1 Create the `StatsPage` component in `src/pages/StatsPage.tsx`.
- [x] 3.2 Integrate `useBillStats` with `StatsPage` state (selected date, income/expense mode).
- [x] 3.3 Render the `DateRangePicker` and `IncomeExpenseToggle` at the top of `StatsPage`.
- [x] 3.4 Render the Participants and Categories `PieChart`s with their respective `LegendBar`s.
- [x] 3.5 Render the comparative `BarChart` at the bottom of the page.

## 4. Integration & Routing

- [x] 4.1 Update `src/components/Layout/BottomNav.tsx` to link the "Stats" tab to the new `StatsPage` (replacing any placeholder).
- [x] 4.2 Update `src/App.tsx` or main routing logic to handle the new `StatsPage` route.
- [x] 4.3 Ensure the `StatsPage` correctly respects global contexts like `useDebugConfig` (shadows, textures) and `useAuth`.

## 5. Polish & Verification

- [x] 5.1 Verify responsive layout on mobile screens.
- [x] 5.2 Test edge cases: empty data state (no bills in selected month), unmapped emojis falling back to "Other".
- [x] 5.3 Review UI against the "cool" and "premium" aesthetic requirements.
