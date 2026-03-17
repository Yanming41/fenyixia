## Why
The current WeChat-style contact list (`ContactsPage.tsx`) recalculates pinyin sorting and A-Z grouping on every render when the search state changes. For users with many contacts, this heavy synchronous computation blocking the main thread causes severe UI jank and lagging during search input. By caching the pinyin derivation on the friend objects, we can make the contact list buttery smooth.

## What Changes
- **Contact Model Upgrade**: Add `pinyinName` and `initial` fields to the `FriendWithAlias` interface (client-side only, no database changes needed).
- **Data Fetching Layer**: Intercept the Supabase response in `getFriends()` and eagerly compute the pinyin values exactly once when the data is loaded.
- **Sorting & Grouping Utility**: Refactor `groupByInitial` and `getActiveLetters` in `src/lib/pinyin.ts` to read the cached keys rather than calling `pinyin-pro` on the fly.
- **Search Experience Upgrade**: Modify the search filter in `ContactsPage.tsx` to additionally match against the `pinyinName`, enabling users to search for "zs" to find "张三" (Zhang San).

## Capabilities

### Modified Capabilities
- `contact-directory-ui`: Contact list rendering performance MUST be optimized via client-side caching. Global search MUST support matching by pinyin.

## Impact
- **Code**: `src/lib/api/friends.ts`, `src/lib/pinyin.ts`, and `src/pages/ContactsPage.tsx` will be modified.
- **Dependencies**: No new packages. `pinyin-pro` is already installed.
- **Performance**: Contact list sorting and rendering will drop from O(N * PinyinCalc) per keystroke to O(N) simple string comparisons per keystroke.
