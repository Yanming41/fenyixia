## Context

The "fenyixia" app is a shared bill tracking application. Users currently have a Home Page that displays their active bills in either a carousel or list format, focusing on recent and unsettled transactions. However, there is no way to view aggregated financial activity over time. Users need a "Statistics" dashboard to track how much they are spending, what categories they spend on, and their financial flow (paid vs. received) with other members. 

The application utilizes React, TypeScript, and a custom CSS-based design system that explicitly avoids standard UI libraries in favor of a bespoke, skeuomorphic/neumorphic aesthetic (controlled by contexts like `useDebugConfig` with flags for `showShadows`, `showTexture`, `showSheen`). The data layer is currently driven by a `useBills` hook returning `Bill` objects.

## Goals / Non-Goals

**Goals:**
- Provide a `StatsPage` accessible via the bottom navigation.
- Implement a custom date picker supporting month or specific day selection, matching the app's aesthetic.
- Aggregate bill data to calculate total expenses and incomes for the selected period.
- Visualize participant distribution (who is involved in the user's bills) using a pie chart.
- Visualize category distribution using a pie chart.
- Provide a comparative bar chart showing trends over the selected time period (e.g., daily breakdown for a selected month).
- Design and implement category classification based on existing bill data (e.g., mapping emojis to categories).

**Non-Goals:**
- Backend changes to support complex querying (aggregation will happen client-side for now, assuming the data set per user is manageable).
- Adding complex budget setting features or alerts.
- Creating a complete historical archive page (only statistics are in scope).
- Modifying the core `Bill` data structure in the database if possible (prefer deriving categories).

## Decisions

### 1. Data Aggregation Strategy
**Decision:** Implement a custom React hook `useBillStats(bills: Bill[], dateRange: DateRange, type: 'expense' | 'income')`.
**Rationale:** The `useBills` hook already fetches the user's relevant bills. To keep concerns separated, `useBillStats` will take the raw bills and the current filter states (date, type) and return memoized computed data (totals, category summaries, participant summaries, trend data).
**Alternatives Considered:** Server-side aggregation via Supabase Edge Functions. Rejected because the dataset per user is currently small enough to handle client-side, reducing latency and backend complexity for this iteration.

### 2. Category Classification
**Decision:** Derive categories from the existing `Bill.icon` (emoji) field using a predefined mapping object in the frontend (e.g., `EMOJI_TO_CATEGORY_MAP`).
**Rationale:** The `Bill` type currently lacks a `category` field. Adding one would require schema migrations and updating existing data. Emojis are already categorized naturally by users (🍔 for food, 🚗 for transport). This is a lightweight, zero-migration approach. We will include a "Fallback/Other" category for unmapped emojis.
**Alternatives Considered:** 
- Modifying the `Bill` interface and database schema to add a `category_id`. Considered too heavy for this initial iteration, though it might be necessary later if users want custom categories.

### 3. Charting Implementation
**Decision:** Implement bespoke SVG-based charts or highly customized CSS-based charts instead of an off-the-shelf library like Recharts or Chart.js.
**Rationale:** The application has a very specific "premium" aesthetic (`no-shadow`, `no-texture`, `no-sheen` toggles) that heavy charting libraries struggle to match without extensive overriding. Simple, custom animated SVGs for pie charts and CSS flexbox for bar charts will perform better, weigh less, and integrate seamlessly with the app's dark/light modes and debug toggles.
**Alternatives Considered:** Recharts. Pros: Fast implementation. Cons: Hard to make it look "cool" and native to this specific app's unique design language.

### 4. Date Selection UI
**Decision:** Build a custom horizontal scrollable timeline or a bespoke modal picker for date selection.
**Rationale:** Standard HTML `<input type="date">` is visually inconsistent across platforms and usually ugly. To meet the requirement of a "cool design," a custom component is necessary.

## Risks / Trade-offs

- **Risk:** Client-side aggregation might cause performance issues if a user has thousands of bills.
  **Mitigation:** Use `useMemo` aggressively in `useBillStats`. If performance becomes an issue, add pagination to `useBills` and migrate aggregation to a Supabase RPC or Edge Function in a future update.
- **Risk:** Emoji-to-Category mapping is inherently flawed and subjective (e.g., is 🍻 Food or Entertainment?).
  **Mitigation:** Provide a broad, sensible default map and group edge cases into "Other". Accept this as a V1 limitation for the sake of speed and no-migration.
- **Risk:** Custom SVG charts take longer to build than using a library.
  **Mitigation:** Keep the chart requirements strictly scoped to exactly what is needed (basic pie, basic bar) with minimal interactivity (tooltips) at first.

## Migration Plan
No database schema migrations are strictly required if we proceed with the emoji-based categorization. The feature can be rolled out purely as a frontend update.
