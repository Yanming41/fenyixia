## 1. Type Definitions Updates
- [x] 1.1 Update `FriendWithAlias` interface in `src/lib/api/friends.ts` to include `_pinyinInitial` and `_pinyinSortKey`

## 2. API Layer Updates
- [x] 2.1 Modify `getFriends` in `src/lib/api/friends.ts` to calculate and append `_pinyinInitial` and `_pinyinSortKey` upon data return

## 3. Pinyin Utilities Refactoring
- [x] 3.1 Update `getInitial` and `getPinyinSortKey` parameters and logic in `src/lib/pinyin.ts` if necessary
- [x] 3.2 Refactor `groupByInitial` in `src/lib/pinyin.ts` to sort and group using the cached `_pinyinSortKey` and `_pinyinInitial` instead of calling the pinyin library
- [x] 3.3 Refactor `getActiveLetters` in `src/lib/pinyin.ts` to use cached `_pinyinInitial`

## 4. UI Layer Integration
- [x] 4.1 Update `ContactsPage.tsx` search filter logic to strictly match against the new `_pinyinSortKey`
- [x] 4.2 Ensure `ContactsPage.tsx` passes the friend objects correctly to the updated pinyin utility functions
