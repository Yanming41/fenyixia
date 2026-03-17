## 1. Type Declarations
- [ ] 1.1 Update `FriendWithAlias` interface in `src/lib/api/friends.ts` to include optional `pinyinName?: string` and `initial?: string` properties.

## 2. Pinyin Caching
- [ ] 2.1 Refactor `getFriends` function in `src/lib/api/friends.ts` to compute and attach `pinyinName` and `initial` to each friend object before returning.

## 3. Sorting Utility Refactor
- [ ] 3.1 Update `getPinyinSortKey` and `getInitial` in `src/lib/pinyin.ts` to accept the precomputed cached fields instead of synchronously decoding pinyin.
- [ ] 3.2 Update `groupByInitial` and `getActiveLetters` in `src/lib/pinyin.ts` to use the cached derivations without modifying the original logic.

## 4. UI Refactor
- [ ] 4.1 Update `filtered` useMemo in `ContactsPage.tsx` to include `f.pinyinName?.includes(q)` in the filtering heuristic.
- [ ] 4.2 Verify A-Z quick jump and contact grouping still behave exactly identically but with improved performance during typing.
