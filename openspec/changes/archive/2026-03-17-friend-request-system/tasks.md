## 1. 数据库层

- [x] 1.1 创建 `friend_requests` 表（id, from_user, to_user, status, created_at, updated_at），添加 unique 约束和 RLS 策略
- [x] 1.2 创建 `search_user_by_email(email text)` RPC 函数（SECURITY DEFINER），返回匹配用户的 id/name/emoji，排除自己
- [x] 1.3 创建 `accept_friend_request(request_id uuid)` RPC 函数，在事务中更新 status 为 accepted 并插入 friendships 记录
- [x] 1.4 创建 `reject_friend_request(request_id uuid)` RPC 函数，更新 status 为 rejected
- [ ] 1.5 在 Supabase Dashboard 中执行以上 SQL 并验证

## 2. API 层 (src/lib/api/friends.ts)

- [x] 2.1 新增 `searchUserByEmail(email: string)` 函数，调用 search_user_by_email RPC
- [x] 2.2 新增 `sendFriendRequest(toUserId: string)` 函数，插入 friend_requests 记录；如果对方已向我发送 pending 申请则自动接受
- [x] 2.3 新增 `getReceivedRequests()` 函数，查询收到的 pending 申请及发送人信息
- [x] 2.4 新增 `getSentRequests()` 函数，查询已发送的 pending 申请及接收人信息
- [x] 2.5 新增 `acceptFriendRequest(requestId: string)` 函数，调用 accept_friend_request RPC
- [x] 2.6 新增 `rejectFriendRequest(requestId: string)` 函数，调用 reject_friend_request RPC
- [x] 2.7 修改 `addFriend(email)` 函数：已注册用户不再直接 upsert friendships，改为调用 sendFriendRequest

## 3. FriendsPage 重构 (src/pages/FriendsPage.tsx)

- [x] 3.1 重构页面布局：顶部「好友申请」区域 + 下方「我的好友」列表
- [x] 3.2 实现邮箱搜索 UI：输入框 + 搜索按钮，显示搜索结果（用户信息 + 发送申请按钮）
- [x] 3.3 处理搜索结果状态：未注册（触发邀请）、已是好友、已发送申请、正常显示
- [x] 3.4 实现收到的申请列表：显示发送人 emoji/名称/时间，接受/拒绝按钮
- [x] 3.5 实现已发送申请列表：显示接收人信息和 pending 状态
- [x] 3.6 好友列表改为调用 `getFriends()` 加载已确认好友

## 4. 成员选择改造

- [x] 4.1 修改 ScanPage.tsx：成员加载从 `supabase.from('users').select(...)` 改为 `getFriends()` + 自己
- [x] 4.2 修改 QuickBillPage.tsx：同上
- [x] 4.3 修改 AddBillOverlay.tsx：同上
- [x] 4.4 修改 BillSheet.tsx（如需要）：确保 friends prop 来源正确

## 5. 邀请流程适配

- [x] 5.1 修改 addFriend 中未注册邮箱的处理：保持现有邀请逻辑不变
- [x] 5.2 被邀请人注册后自动创建好友申请：在注册完成的逻辑中检查 invitations 表，为邀请人创建 pending friend_request

## 6. 验证与构建

- [x] 6.1 本地 `npm run build` 确保无 TypeScript 错误
- [ ] 6.2 端到端手动测试：搜索 → 发送申请 → 接受 → 好友列表 → 创建账单成员选择
