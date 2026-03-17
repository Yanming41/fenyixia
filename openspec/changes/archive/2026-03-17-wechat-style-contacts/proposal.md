## Why
The current friend system only supports a simple, flat list of directly confirmed friends. As the user base grows, it becomes difficult to manage relationships. Upgrading to a "WeChat-style" contact book with a global search, A-Z indexing, group chats, and tag management will vastly improve the social organization experience.

## What Changes
- **Contacts Homepage**: Replace the existing friend list with a structured address book. Add A-Z index grouping and a sidebar quick-navigation scrollbar.
- **Top Navigation Entries**: Add fixed entries for "New Friends", "Groups", "Tags".
- **Global Search**: Add a global search bar at the top capable of filtering personal friends, tags, groups, and querying remote emails for new invites.
- **Database Model**:
  - `friendships`: Add `status` (pending/accepted/rejected) and bidirectional `alias` fields.
  - `groups` & `group_members`: New tables to support multi-person chat/bill groups.
  - `user_tags` & `friend_tags`: New tables for personal relationship categorization.
- **Secondary Pages**: Build sub-pages for managing New Friends (invites), Group Chats, and Tags. 

## Capabilities

### New Capabilities
- `contact-groups`: Implementation of public/shared group entities.
- `contact-tags`: Implementation of private user-defined tags for contact categorization.
- `contact-requests`: Implementation of a request/approval flow for adding new friends.
- `contact-directory-ui`: Implementation of WeChat-style UI (A-Z indexing, global search).

### Modified Capabilities

## Impact
- **Database**: Migration script needed to add minimum 4 new tables and alter `friendships`.
- **UI Architecture**: Major redesign of `FriendsPage.tsx` into a multi-level routing structure (`/contacts`, `/contacts/new`, `/contacts/groups`, `/contacts/tags`).
- **Performance**: A-Z sorting and global search need optimized client-side filtering.
