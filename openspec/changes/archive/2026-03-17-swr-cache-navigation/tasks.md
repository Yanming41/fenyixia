## 1. Setup

- [x] 1.1 Install `swr` dependency
- [x] 1.2 Add `SWRConfig` provider in `App.tsx` with global defaults (revalidateOnFocus, dedupingInterval)

## 2. Core SWR Hooks

- [x] 2.1 Rewrite `src/hooks/useBills.ts` to use `useSWR` with key `'bills'`
- [x] 2.2 Create `src/hooks/useFriends.ts` with `useSWR` for friends, received requests, and sent requests
- [x] 2.3 Create `src/hooks/useGroups.ts` with `useSWR` for groups
- [x] 2.4 Create `src/hooks/useTags.ts` with `useSWR` for tags

## 3. Page Integration

- [x] 3.1 Update `ContactsPage` to use `useFriends` hook instead of inline useState+useEffect
- [x] 3.2 Update `NewFriendsPage` to use `useFriends` hook
- [x] 3.3 Update `GroupsPage` to use `useGroups` hook
- [x] 3.4 Update `TagsPage` to use `useTags` hook
- [x] 3.5 Update `HomePage` / any bill consumers to use the rewritten `useBills`

## 4. Mutation Integration

- [x] 4.1 Add `mutate('bills')` calls after bill create/update/delete in `AddBillOverlay` and related components
- [x] 4.2 Add `mutate('friends')` / `mutate('received-requests')` calls after accept/reject/add friend
- [x] 4.3 Add `mutate('groups')` calls after group create/delete
- [x] 4.4 Add `mutate('tags')` calls after tag create/update/delete

## 5. Verification

- [x] 5.1 Build succeeds with no TypeScript errors
- [x] 5.2 Test navigation flow: HomePage → ContactsPage → back — no loading flicker
