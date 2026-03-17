## Why

Every time a user switches between bottom nav tabs (e.g. HomePage → ContactsPage → StatsPage), React Router destroys the old page component and mounts a new one. All local `useState` data is lost, forcing each page to re-fetch from Supabase and show "加载中..." — creating a sluggish, non-native feel. Introducing SWR (Stale-While-Revalidate) will give the app instant tab switching by serving cached data first, then silently revalidating in the background.

## What Changes

- **Add `swr` dependency**: Install the lightweight Vercel SWR library for global, key-based request caching.
- **Replace `useBills` hook**: Swap `useState` + `useEffect` fetch pattern with `useSWR`, so bills are cached across page navigations and auto-revalidated on focus/mount.
- **Replace contacts data fetching in `ContactsPage`**: Use `useSWR` for `getFriends` and `getReceivedRequests` so contacts load instantly when switching back.
- **Replace stats data fetching**: Same SWR pattern for the statistics page data.
- **Global SWR configuration**: Add an `SWRConfig` provider at the app root with sensible defaults (revalidateOnFocus, dedupingInterval).
- **Mutation integration**: Use `mutate()` after create/update/delete operations (e.g. adding a bill, accepting a friend request) so the UI updates immediately without a full refetch.

## Capabilities

### New Capabilities
- `swr-data-cache`: Implementation of SWR-based data fetching layer with global cache, stale-while-revalidate strategy, and mutation hooks replacing the current useState+useEffect pattern.

### Modified Capabilities

## Impact

- **Dependencies**: New npm dependency `swr` (~4KB gzipped).
- **Hooks**: `useBills` (complete rewrite), new `useFriends`/`useContacts` hook, `useBillStats` may be updated.
- **Pages**: `HomePage`, `ContactsPage`, `StatsPage`, `NewFriendsPage`, `GroupsPage`, `TagsPage` — all switch from local state fetching to SWR hooks.
- **App root**: `App.tsx` gets an `SWRConfig` wrapper.
- **API layer**: No changes — existing fetch functions (`fetchMyBills`, `getFriends`, etc.) remain as SWR fetchers.
