## Context
The contacts list utilizes `pinyin-pro` to group and sort Chinese names. Currently, this computation happens synchronously during React's render phase within a `useMemo` hook in `ContactsPage.tsx`. As the number of friends grows, the real-time conversion of Chinese characters to pinyin strings blocks the main thread, resulting in severe lag when typing in the search box or first loading the page.

## Goals / Non-Goals

**Goals:**
- Eliminate the main-thread blocking caused by `pinyin-pro` during UI rendering.
- Pre-compute pinyin sort keys and initials immediately after fetching friend data from the backend.
- Enhance the global search functionality to support searching users by their pinyin representations.

**Non-Goals:**
- Removing `pinyin-pro` entirely. It's still necessary; we are just shifting *when* it runs.
- Persisting pinyin keys in the Supabase database. These are client-derived strings only for UI sorting/filtering and shouldn't pollute the backend schema.

## Decisions
- **Decision: Cache pinyin data dynamically on API fetch**
  - **Rationale:** Instead of storing pinyin in the database (which would require complex sync logic whenever a user changes their name or alias), we simply intercept the `getFriends` API response. We calculate `_pinyinInitial` and `_pinyinSortKey` once per friend and attach it to the `FriendWithAlias` interface. This bounds the computation to a single O(N) pass during the network loading state, rather than O(N log N) during every keystroke re-render.
- **Decision: Keep `ContactsPage` logic simple and declarative**
  - **Rationale:** The `groupByInitial` and `getActiveLetters` helpers in `src/lib/pinyin.ts` will be updated to read the pre-computed properties directly instead of executing expensive function calls.

## Risks / Trade-offs
- **[Risk] Increased Memory Usage** → Storing an extra string (the full pinyin representation) per user in memory. Since contacts lists on personal apps rarely exceed a few thousand, the memory footprint of an extra 20-30 characters per user is negligible (a few dozen KBs).
- **[Risk] Slight delay during initial loading** → The computation is shifted to the API layer, which might add a few milliseconds to the "Loading..." state. This is highly preferable over dropping frames during user interaction.
