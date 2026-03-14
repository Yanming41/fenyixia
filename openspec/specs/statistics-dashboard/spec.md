## ADDED Requirements

### Requirement: core-statistics-dashboard
The application MUST provide a designated Statistics Dashboard page accessible to the user, aggregating financial data from settled bills.

#### Scenario: navigating-to-stats
- **WHEN** the user navigates to the Statistics tab
- **THEN** the dashboard is displayed, showing unified data aggregations

### Requirement: flexible-time-filtering
The dashboard MUST allow the user to filter all aggregated data by a specific date range (e.g., a specific month or a specific day).

#### Scenario: filtering-by-month
- **WHEN** the user selects a specific month (e.g., March 2026)
- **THEN** all charts and totals on the dashboard update to reflect only bills dated within March 2026

### Requirement: income-expense-toggle
The dashboard MUST provide a toggle to switch the context between "Expense" (money paid out to others) and "Income" (money received from others) for settled bills.

#### Scenario: switching-to-income-view
- **WHEN** the user toggles to the "Income" view
- **THEN** the total amount metric displays the sum of money collected back from others
- **AND** the charts reflect the distribution of this collected money

### Requirement: participant-distribution-chart
The dashboard MUST render a pie chart showing the distribution of the current financial context (Income or Expense) across different participants.

#### Scenario: viewing-expense-participants
- **WHEN** the user is in the "Expense" view
- **THEN** the pie chart displays the proportion of money the user has paid to each individual friend (e.g., 60% to Alice, 40% to Bob)
- **AND** an accompanying detailed legend bar is displayed

### Requirement: category-distribution-chart
The dashboard MUST render a pie chart showing the distribution of the current financial context (Income or Expense) across different categories.

#### Scenario: viewing-expense-categories
- **WHEN** the user is in the "Expense" view
- **THEN** the pie chart displays the proportion of money spent across categories (e.g., 70% Food, 30% Transport)
- **AND** an accompanying detailed legend bar is displayed

### Requirement: comparative-trend-chart
The dashboard MUST render a bar chart showing chronological trends (e.g., daily totals if a month is selected) for the current financial context.

#### Scenario: viewing-monthly-trend
- **WHEN** the user filters by a specific month
- **THEN** the bar chart at the bottom displays a series of bars representing the total amount for each day of that month
