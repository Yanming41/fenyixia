## 1. Database Migrations
- [x] 1.1 Create migration SQL for `friendships` table (add `status`, `alias_a`, `alias_b`)
- [x] 1.2 Create migration SQL for `groups` and `group_members` tables
- [x] 1.3 Create migration SQL for `user_tags` and `friend_tags` tables
- [x] 1.4 Update RLS policies for all new and modified tables

## 2. API Layer Updates
- [x] 2.1 Update `src/lib/api/friends.ts` to handle pending/accepted states and aliases
- [x] 2.2 Create `src/lib/api/groups.ts` for group CRUD and member management
- [x] 2.3 Create `src/lib/api/tags.ts` for tag CRUD and tag assignment

## 3. UI Foundation & Routing
- [x] 3.1 Setup routes for `/contacts`, `/contacts/new`, `/contacts/groups`, `/contacts/tags`
- [x] 3.2 Create the top-level `ContactsPage` layout with the global search bar
- [x] 3.3 Create the Top Navigation Entries component (New Friends, Groups, Tags)

## 4. Contact Directory (A-Z List)
- [x] 4.1 Implement Pinyin/Alphabetical sorting and grouping utility functions
- [x] 4.2 Build the `ContactList` component with A-Z headers
- [x] 4.3 Build the right-side A-Z quick-jump slider

## 5. Secondary Pages
- [x] 5.1 Build `NewFriendsPage` to show pending requests and search for emails
- [x] 5.2 Build `GroupsPage` listing all user groups
- [x] 5.3 Build `TagsPage` showing tag cards
- [x] 5.4 Build `ContactProfileOverlay` to handle editing alias and assigning tags

## 6. Integration & Search
- [x] 6.1 Implement client-side filtering logic for the global search bar
- [x] 6.2 Implement server-side search fallback when inputting an email address
- [x] 6.3 Test all flows (sending request -> accepting -> assigning tag -> searching)
