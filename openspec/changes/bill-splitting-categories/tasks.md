## 1. API Layer

- [x] 1.1 Add `getFriendsByTag(tagId: string): Promise<Member[]>` function to `src/lib/api/tags.ts` that joins `friend_tags` → `friendships` → `users` to resolve all friends with a given tag
- [x] 1.2 Ensure `useGroups` hook exposes groups with pre-fetched `members: Member[]` for consumption by the picker
- [x] 1.3 Ensure `useTags` hook exposes tags list for consumption by the picker

## 2. MemberPickerSheet Component

- [x] 2.1 Create `src/components/MemberPicker/MemberPickerSheet.tsx` — main container component managing `selectedIds: Set<string>` state
- [x] 2.2 Implement Groups section: horizontally scrollable chips, tap to batch-toggle members, active highlight when all members selected
- [x] 2.3 Implement Tags section: horizontally scrollable chips, tap to resolve and batch-toggle tagged friends, active highlight logic
- [x] 2.4 Implement Friends section: A-Z sorted list using pinyin cache, checkboxes synced with `selectedIds`, search bar filtering by name/alias/pinyin
- [x] 2.5 Implement selected members bubble bar: horizontally scrollable, shows emoji + name + ✕ for each selected member, handles non-friend members from groups
- [x] 2.6 Add "＋ 新群组" inline creation dialog (name + emoji + member selection, calls `createGroup`)
- [x] 2.7 Add "＋ 新标签" inline creation dialog (name + color, calls `createTag`)
- [x] 2.8 Add personalization placeholder (hidden/commented slot for future module)

## 3. BillSheet Integration

- [x] 3.1 Replace the flat friend-chip "分给" section in `BillSheet.tsx` with `MemberPickerSheet` for each bill item
- [x] 3.2 Wire `MemberPickerSheet` output (`selectedIds`) into the existing `EditItem.memberIds` state
- [x] 3.3 Pass groups, tags, and friends data from hooks into `BillSheet` and down to the picker

## 4. Styling

- [x] 4.1 Add CSS for the member picker: group/tag chip styles, A-Z section headers, bubble bar, inline dialogs
