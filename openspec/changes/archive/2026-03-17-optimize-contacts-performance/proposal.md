## Why
Currently, the contact list undergoes heavily blocking synchronous operations in the browser's main thread due to frequent real-time calculations using `pinyin-pro`. Whenever a user searches or views their contacts, `ContactsPage` re-calculates the pinyin sort keys and initial letters for all friends, causing noticeable lag and frame drops. By moving this computation to the time of data fetching and caching it locally, we can achieve instant filtering and rendering.

## What Changes
- **API Response Caching**: `getFriends` in `src/lib/api/friends.ts` will pre-calculate and cache `_pinyinInitial` and `_pinyinSortKey` for each user object immediately after fetching from the database.
- **Pinyin Utils Refactoring**: `groupByInitial` and `getActiveLetters` in `src/lib/pinyin.ts` will be simplified to read the pre-cached keys instead of taking a mapping function and recalculating pinyin.
- **Enhanced Search**: The global search filter in `ContactsPage.tsx` will be updated to also match `_pinyinSortKey`, enabling native pinyin string search (e.g., typing "zs" for "zhangsan").

## Capabilities

### New Capabilities
- `pinyin-caching`: Strategy for pre-computing and sorting Chinese characters using pinyin keys.

### Modified Capabilities

## Impact
- **Performance**: Drastic reduction in React DOM computation times (from O(N) complex string generation to O(1) string matching/comparison per user).
- **UX**: Search will feel significantly smoother, and users gain a new capability to search using un-capitalized Pinyin text.
