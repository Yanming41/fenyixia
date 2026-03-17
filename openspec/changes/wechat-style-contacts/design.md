## Context
As the user base and feature set grow, the simple list of directly confirmed friends is no longer sufficient. Users need a more organized way to manage relationships, similar to mainstream apps like WeChat. This includes handling friend requests ("New Friends"), creating group chats ("Groups"), categorizing contacts ("Tags"), and easily navigating a large list via A-Z indexing and global search.

## Goals / Non-Goals

**Goals:**
- Redesign the contacts page into a structured address book with A-Z indexing and a sidebar scrollbar.
- Implement a global search feature for filtering contacts, groups, tags, and searching remote users by email.
- Establish the data structures for a bidirectional friend request system (with `status` and `alias`).
- Establish the data structures for public groups (`groups`, `group_members`) and private tags (`user_tags`, `friend_tags`).
- Create secondary pages for managing New Friends, Groups, and Tags.

**Non-Goals:**
- Implementing the multi-tiered bill splitting system. This change focuses *exclusively* on building the foundation of the contacts/friend system.
- Real-time chat messaging. "Groups" here refers to relationship and bill-sharing groupings, not an instant messaging feature.

## Decisions
- **Decision: Separate `status` on `friendships` vs a new `friend_requests` table**
  - **Rationale:** Adding a `status` ('pending', 'accepted', 'rejected') to the existing `friendships` table is simpler and requires fewer joins than spinning up a new table. Both users still get a record.
- **Decision: Private Tags vs Public Tags**
  - **Rationale:** Contact tags (e.g., "Coworkers", "Roommates") are highly personal and should only be visible to the user who created them. Therefore, `user_tags` will belong to a specific `user_id`, and `friend_tags` will map an individual's `friendship_id` to their own tags.
- **Decision: Global Search matching Strategy**
  - **Rationale:** The search box at the top of the Contacts page will filter local data (friends whose name or alias matches, groups, tags) immediately on the client-side. If the input matches an email format AND no local contact is found, it will trigger a server-side search to allow sending a new friend request.

## Risks / Trade-offs
- **[Risk] Complex UI State:** A-Z indexing, side-scrolling, and instant search require efficient DOM rendering and state management.
  - **Mitigation:** Use `useMemo` for sorting and grouping contacts by Pinyin/alphabet.
- **[Risk] RLS Complexity:** Giving users access to group members and pending friend requests requires careful Row Level Security policy updates.
  - **Mitigation:** RLS policies for `friendships` will be expanded to allow reading `pending` requests directed at `auth.uid()`. `groups` will be readable by members.
