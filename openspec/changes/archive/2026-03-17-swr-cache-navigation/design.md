## Context

The app currently uses `useState` + `useEffect` for all data fetching. When React Router switches routes, the old page unmounts (destroying its state) and the new page mounts fresh, triggering a new fetch and showing "加载中...". This happens on every single tab switch, making the app feel slow despite the data already having been loaded moments ago.

The existing data-fetching hooks are:
- `useBills()` — fetches bills + payment proofs/manual payments, used in `HomePage` and `App.tsx`
- `ContactsPage` — inline `useEffect` + `useState` calling `getFriends()` / `getReceivedRequests()`
- `StatsPage` — uses `useBillStats()` which depends on `useBills()`
- `NewFriendsPage`, `GroupsPage`, `TagsPage` — each has its own inline fetch pattern

## Goals / Non-Goals

**Goals:**
- Eliminate "加载中..." flicker when switching between already-visited tabs
- Serve cached data instantly on re-mount, then silently revalidate in background
- Keep existing API functions as-is — SWR wraps them, doesn't replace them
- Provide `mutate()` integration so create/update/delete actions update the cache immediately

**Non-Goals:**
- Offline support or persistent storage (IndexedDB, localStorage) — SWR's in-memory cache is sufficient
- Real-time subscriptions (Supabase Realtime) — out of scope for this change
- Refactoring the API layer (`src/lib/api/*`) — these functions stay unchanged

## Decisions

- **Decision: Use SWR over React Query / TanStack Query**
  - **Rationale:** SWR is smaller (~4KB), API is simpler, and fits our needs perfectly. We don't need React Query's heavier features (infinite queries, optimistic updates framework, devtools). SWR's `useSWR(key, fetcher)` pattern maps 1:1 to our existing fetch functions.

- **Decision: Global `SWRConfig` at app root with sensible defaults**
  - **Rationale:** Setting `revalidateOnFocus: true`, `dedupingInterval: 5000` at the root means all hooks get consistent behavior without per-hook configuration. Individual hooks can override if needed.

- **Decision: Cache key convention — use string keys matching API function names**
  - **Rationale:** Simple, debuggable keys like `'bills'`, `'friends'`, `'groups'`, `'tags'`, `'received-requests'`. No complex key factories needed for this app's scale.

- **Decision: Rewrite `useBills` hook, create new `useFriends` / `useGroups` / `useTags` hooks**
  - **Rationale:** Centralizing SWR hooks in `src/hooks/` keeps the pattern consistent and allows pages to share cached data through SWR's global cache. Pages import hooks instead of calling API functions directly.

- **Decision: Use `mutate()` after mutations, not optimistic updates**
  - **Rationale:** Our mutations are fast enough that calling `mutate(key)` to trigger a revalidation after a successful write is simpler and less error-prone than optimistic updates. We avoid the complexity of rollback logic.

## Risks / Trade-offs

- **[Risk] Stale data shown briefly after mutations if revalidation is slow**
  - **Mitigation:** Call `mutate(key)` immediately after successful mutations. SWR will refetch and update the UI. For critical actions (accept friend request), we can pass updated data directly to `mutate(key, newData, false)` to skip the refetch.

- **[Risk] Memory usage with cached data**
  - **Mitigation:** SWR's default cache is in-memory and garbage-collected when keys are no longer used. Our data volume (bills, friends) is small enough that this is not a concern.

- **[Trade-off] New dependency**
  - SWR adds ~4KB gzipped. Acceptable for the UX improvement it provides.
