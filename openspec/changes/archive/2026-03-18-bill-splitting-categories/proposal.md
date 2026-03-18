## Why

The current bill creation flow ("分给" section in `BillSheet`) displays a flat list of all friends. As the user's social graph grows, finding the right people becomes painful. Users need a structured, multi-dimensional way to quickly select who participates in a bill — by group, by tag, or by individual friend — with the ability to create new groups/tags inline without leaving the flow.

## What Changes

- **New member picker component**: Replace the flat friend list in `BillSheet.tsx` with a 3-module picker:
  1. **Groups module** — Horizontally scrolling chips; selecting a group adds all its members; supports inline group creation.
  2. **Tags module** — Horizontally scrolling chips; selecting a tag adds all friends with that tag; supports inline tag creation.
  3. **Friends module** — A-Z sorted, vertically scrolling list with search; supports inline friend-adding/inviting.
- **Selected members bubble bar**: A horizontally scrollable bar showing all currently selected members (from any source), with individual removal (✕). This is the single source of truth for who is being billed.
- **Group members may not be friends**: Groups can contain non-friend users. The picker must handle members that don't appear in the A-Z friends list by including them only in the bubble bar.
- **Personalization placeholder**: A hidden slot reserved for future personalized recommendations (last-used group, frequent contacts). Not implemented in this change.
- **Tags API enhancement**: Add a function to resolve all friends (user IDs) associated with a given tag, leveraging the existing `friend_tags` join table.

## Capabilities

### New Capabilities
- `bill-member-picker`: The new 3-module member selection UI for the bill creation/editing flow, including group/tag shortcut logic, selected bubble bar, inline creation dialogs, and friend search.

### Modified Capabilities
- `contact-groups`: Groups now expose a "select all members" action for use in the bill picker context.
- `contact-tags`: Tags now expose a "resolve all tagged friends" action for use in the bill picker context.

## Impact

- **UI**: `BillSheet.tsx` — major refactor of the "分给" section for each bill item.
- **API**: `tags.ts` — new `getFriendsByTag(tagId)` function to resolve tag → user IDs.
- **Hooks**: May need `useGroups` and `useTags` hooks to be consumed within `BillSheet`.
- **Data model**: No database schema changes required. All data is already available through existing tables (`groups`, `group_members`, `user_tags`, `friend_tags`, `friendships`).
