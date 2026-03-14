## Why

The current application provides a great view of individual bills and their split details, but it lacks a high-level overview of a user's financial activities over time. Users need a centralized "Statistics" (统计) dashboard to understand their spending habits, track settled bills (both paid out and received), and visualize financial flow by categories and participants. This feature will significantly enhance the user's sense of control and transparency over their shared finances. 

## What Changes

We will introduce a new comprehensive **Statistics Dashboard** with the following capabilities:

1. **Flexible Time Filtering**: 
   - Users can select a specific date range, filtering data down to a specific year, month, or even a precise day.
   - The design for the date picker will be modern and "cool," fitting the app's premium aesthetic.

2. **Income vs. Expense Toggle (支出/入账)**: 
   - Users can switch between viewing what they have paid out (Expense) and what they have collected back (Income) from settled bills.

3. **Visual Breakdown (Pie Charts)**: 
   - **Participants Pie Chart**: Shows who the user interacts with most financially (e.g., who they split the most bills with or who owes them the most).
   - **Category Pie Chart**: Shows spending/collection breakdowns by category (e.g., Food, Transport, Entertainment). Categories will either be derived from emojis or introduced as a new field.

4. **Legend Bars**:
   - Two detailed legend bars placed below the pie charts to explicitly explain the data distribution for Participants and Categories.

5. **Comparative Bar Charts**:
   - A historical comparison chart at the bottom, dynamically adjusting based on the selected time filter (e.g., comparing days if filtered by month, or months if filtered by year) to show trends over time.

*(Note: Historical bills feature is deferred and will not be included in this specific change).*

## Capabilities

### New Capabilities
- `statistics-core`: The main dashboard page (`StatsPage`), including the date picker, income/expense toggle, and data aggregation logic.
- `statistics-visuals`: The charting components, specifically the Participants pie chart, Category pie chart, legend bars, and the comparative bar charts.
- `category-classification`: The logic required to group bills into meaningful categories for statistics (either via emoji mapping or a new tag).

### Modified Capabilities
- `stats-placeholder`: The existing `stats-placeholder` spec (which likely currently defines the empty/coming soon state for the stats tab) will be heavily modified or replaced by this new implementation.
- `react-app-shell`: Will need to be updated to integrate the new Statistics page properly into the bottom navigation if it isn't already a fully functional tab.

## Impact

- **UI/UX**: Introduces complex interactive charts and date pickers. Must adhere to the existing `no-shadow`, `no-texture`, `no-sheen` dynamic aesthetics.
- **Data Layer**: Requires new aggregation hooks (e.g., `useBillStats`) to process the raw `bills` data efficiently for visualization without degrading performance.
- **Routing/Navigation**: Changes the destination and behavior of the "Stats" tab in the `BottomNav`.
