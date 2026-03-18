## Context

The current bill creation flow (`BillSheet.tsx`) shows a flat, horizontally wrapping list of friend chips under each bill item's "分给" label. Users select who participates by toggling individual chips. The friends list is passed in from the `useFriends()` hook via `AddBillOverlay`.

As the user's contact network grows (groups, tags, non-friend group members), the flat list becomes unmanageable. This design introduces a structured 3-module picker to replace it, with groups and tags acting as "shortcut macros" that expand into individual member selections.

Key data model facts:
- **Groups** (`groups` + `group_members` tables) contain `members: Member[]` which may include non-friend users.
- **Tags** (`user_tags` + `friend_tags` tables) label friendships. Tags don't directly carry members — resolution requires joining through `friend_tags` → `friendships` → `users`.
- **Friends** are fetched via `getFriends()` and carry pinyin cache fields for A-Z sorting.
- The final billing data model (`bill_item_members`) only stores flat `user_id` entries — no concept of groups or tags at the billing layer.

## Goals / Non-Goals

**Goals:**
- Replace the flat "分给" friend chips with a 3-module picker (Groups → Tags → Friends A-Z).
- Groups and tags act as "shortcut macros" — selecting one batch-selects all its members as individual entries.
- Allow users to fine-tune after macro-selection (deselect individuals).
- Show all selected members in a unified bubble bar with individual ✕ removal.
- Support inline creation of new groups and tags without leaving the bill flow.
- Handle group members who are not in the user's friend list.
- Reserve a hidden placeholder for future personalization module.

**Non-Goals:**
- Personalization module (last-used, frequent contacts) — deferred.
- Invite new users flow — deferred.
- Changing the database schema for bills/bill_items/bill_item_members.
- Storing which group or tag was used to select members on the bill record.

## Decisions

1. **Groups/Tags are "Macros", not entities**
   - **Decision**: When a group or tag chip is selected, it simply batch-toggles all its member user IDs into the selected set. The final bill payload remains a flat array of `user_id`s. No group/tag metadata is stored on the bill.
   - **Rationale**: This keeps the billing data model unchanged and avoids complex group membership tracking at the bill level.

2. **Single source of truth: the selected `Set<string>` of user IDs**
   - **Decision**: All three modules (groups, tags, friends) read from and write to a single `selectedIds: Set<string>` state. The bubble bar renders this set. Group/tag highlight state is derived (a group chip is "active" iff all its members are in the set).
   - **Rationale**: This eliminates state conflicts between modules and makes deselection intuitive.

3. **Non-friend group members appear only in the bubble bar**
   - **Decision**: If a group contains users not in the friend list, they still get added to `selectedIds`. They show up in the bubble bar (with name + emoji fetched from the group's member data) but do NOT appear in the A-Z friends list.
   - **Rationale**: The A-Z list strictly mirrors the contacts/friends list. Introducing strangers there would be confusing.

4. **New `MemberPickerSheet` component**
   - **Decision**: Extract the member-selection logic into a new reusable component `MemberPickerSheet` that receives `groups`, `tags`, `friends` (all from existing hooks) and emits a `selectedIds: string[]`.
   - **Rationale**: Keeps `BillSheet` focused on bill data; the picker is independently testable and reusable.

5. **Tags API: new `getFriendsByTag` function**
   - **Decision**: Add a new function `getFriendsByTag(tagId: string): Promise<Member[]>` to `tags.ts` that joins `friend_tags` → `friendships` → `users` to resolve members.
   - **Alternative considered**: Pre-loading all friend-tag associations at mount time. Chosen approach is simpler for MVP; can optimize later.

6. **Inline creation via small dialog overlays**
   - **Decision**: "＋ 新群组" and "＋ 新标签" buttons open a minimal dialog (name input + optional member/color selection) overlaid on the picker. On save, the new entity is created via existing API and auto-selected.
   - **Rationale**: Keeps users in flow without navigating away.

## Risks / Trade-offs

- **Risk**: Large groups (30+ members) could make the bubble bar very long.
  - **Mitigation**: Bubble bar is horizontally scrollable; shows count badge (`+12 more`) after N visible chips.

- **Risk**: Tags resolve members asynchronously (DB query), causing a brief delay.
  - **Mitigation**: Show a loading spinner on the tag chip while resolving; cache results for the session.

- **Risk**: `MemberPickerSheet` adds visual complexity to an already large `BillSheet`.
  - **Mitigation**: The picker is collapsible/expandable per bill item, defaulting to collapsed with a summary of selected members.
