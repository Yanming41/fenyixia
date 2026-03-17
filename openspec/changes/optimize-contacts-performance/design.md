## Context
The recently merged `wechat-style-contacts` introduced A-Z alphabetized grouping and a global search bar. However, the initial implementation uses a naive strategy: every time the search query changes in `ContactsPage.tsx`, the `filtered` list is passed to `groupByInitial` and `getActiveLetters`, both of which call the heavy `pinyin-pro` library synchronously to extract initials and sort keys for every contact.

## Goals / Non-Goals

**Goals:**
- Eliminate UI thread blocking when typing in the contact search bar.
- Pre-compute all pinyin strings exactly once per API fetch.
- Enable pinyin-based searching (e.g. typing "zs" matches "张三").

**Non-Goals:**
- Server-side sorting or pagination (the contact list is small enough to handle purely on the client side if the heavy computations are cached).
- Modifying the remote database schema.

## Decisions
- **Decision: Compute Pinyin at the Data Fetching Layer**
  - **Rationale:** Instead of memoizing components or hacking React context, the cleanest approach is to modify `getFriends()` in `src/lib/api/friends.ts`. As soon as the raw user data is fetched from Supabase, we map over the array and attach `pinyinName` (the full pinyin string without spaces) and `initial` (the A-Z letter) directly onto the object. The rest of the app then receives "decorated" objects.
  - **Alternative:** Computing it in a `useEffect` inside `ContactsPage.tsx`. This was rejected because if other parts of the app (like `GroupsPage` or `AddBillOverlay`) eventually need pinyin sorting, doing it at the API layer allows all consumers to benefit from the cached strings.
- **Decision: Pinyin Search Strategy**
  - **Rationale:** By converting the name "张三" to a `pinyinName` like "zhangsan", we can simply do `f.pinyinName.includes(searchQuery)` in the filtering logic, alongside the existing name/alias checks.

## Risks / Trade-offs
- **[Risk] Slower initial load:** Computing pinyin for all friends right after the network request finishes will slightly delay the promise resolution.
  - **Mitigation:** The computation for a few hundred contacts is typically under 100ms. The UI jank during typing is vastly more noticeable than a 50ms delay during the initial loading spinner.
