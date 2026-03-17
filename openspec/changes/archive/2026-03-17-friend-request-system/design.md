## Context

当前系统的好友功能实质上是「全局用户列表」——`FriendsPage` 加载所有用户，账单创建也从 `users` 表直接 `select *`。`friendships` 表虽然存在，但 UI 端几乎没有用它做过滤。`addFriend` 函数直接 upsert 到 `friendships`，对方无感知。

需要改为：搜索邮箱 → 发送申请 → 对方接受 → 建立双向好友关系。

## Goals / Non-Goals

**Goals:**
- 用户通过邮箱搜索其他已注册用户
- 发送好友申请，对方可接受或拒绝
- 接受后双向建立好友关系（写入 `friendships` 表）
- FriendsPage 展示已确认好友 + 待处理申请
- 账单创建的成员选择仅展示已确认好友

**Non-Goals:**
- 不做实时推送通知（申请通知仅在用户打开好友页面时加载）
- 不做好友分组/标签
- 不修改已有账单中的成员数据（历史账单保持不变）
- 不做拉黑/屏蔽功能

## Decisions

### 1. 新增 `friend_requests` 表，与 `friendships` 表分离

```sql
create table friend_requests (
  id uuid default gen_random_uuid() primary key,
  from_user uuid references users(id) on delete cascade not null,
  to_user uuid references users(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (from_user, to_user)
);
```

**为什么不在 `friendships` 表加 status 字段？** 因为 `friendships` 已有数据且被账单系统引用，加 status 需要修改所有查询。分表更安全，`friendships` 继续作为已确认关系的唯一来源。

### 2. 接受申请时由数据库函数处理

创建 `accept_friend_request(request_id)` RPC 函数，在一个事务中：
1. 更新 `friend_requests.status = 'accepted'`
2. 插入 `friendships` 记录（canonical ordering: user_a < user_b）

**为什么用 RPC 而不是前端分两步操作？** 保证原子性，避免只更新了状态但没插入好友关系的半完成状态。

### 3. 邮箱搜索走 RPC 函数

创建 `search_user_by_email(email)` RPC 函数，返回匹配用户的 `{id, name, emoji}` 基本信息。

**为什么不直接查 users 表？** 当前 RLS 策略允许用户看到所有用户，但我们的目标是收紧权限。通过 SECURITY DEFINER 的 RPC 函数，可以在不暴露整个 users 表的情况下允许精确邮箱搜索。

### 4. 成员选择改为加载好友列表

所有账单创建入口（ScanPage、QuickBillPage、AddBillOverlay/BillSheet）将 `supabase.from('users').select(...)` 改为调用 `getFriends()`，仅加载已确认好友。

### 5. FriendsPage UI 重构

分为两个区域：
- **好友申请**（顶部）：显示收到的待处理申请，每条有「接受」「拒绝」按钮；显示已发送的待处理申请
- **我的好友**（下方）：已确认好友列表 + 底部邮箱搜索添加入口

## Risks / Trade-offs

- **历史数据兼容** → 已有 `friendships` 记录保持不变，老用户的好友关系不受影响。新流程仅影响新增好友操作。
- **RLS 收紧可能影响现有功能** → 先不修改 users 表 RLS，仅在 UI 层做好友过滤。后续可逐步收紧。
- **无实时通知** → 用户需主动打开好友页面查看申请。可在好友页面入口加一个未读数 badge 作为提示。
