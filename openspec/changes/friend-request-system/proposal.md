## Why

当前系统中所有注册用户互相可见，添加好友是单方面操作——输入邮箱就直接建立好友关系，对方没有确认环节。这导致任何人都能把陌生人加为好友并在账单中看到对方信息，缺乏隐私保护。

需要引入好友申请机制：通过邮箱搜索用户 → 发送好友申请 → 对方同意后才建立双向好友关系。

## What Changes

- 新增 `friend_requests` 表，存储好友申请记录（发起人、接收人、状态、时间）
- 修改好友添加流程：输入邮箱搜索 → 发送申请（不再直接建立好友关系）
- 新增好友申请通知：用户可看到收到的待处理申请，可接受或拒绝
- 修改 FriendsPage UI：分为「我的好友」和「好友申请」两个区域
- 修改账单创建时的成员选择：仅显示已确认的好友，而非全部用户
- 调整 RLS 策略：用户只能查看自己的好友，不能看到全部用户列表

## Capabilities

### New Capabilities
- `friend-request`: 好友申请的发送、接收、接受/拒绝流程，包括数据库表设计、API 和 UI

### Modified Capabilities
- `friend-invitation`: 现有的好友邀请逻辑需要适配——已注册用户不再直接建立好友关系，而是发送申请

## Impact

- **数据库**: 新增 `friend_requests` 表，修改 `friendships` 表的写入逻辑（仅在申请通过后写入）
- **API**: `src/lib/api/friends.ts` — 新增 sendRequest / getRequests / acceptRequest / rejectRequest 方法，修改 addFriend 逻辑
- **页面**: `src/pages/FriendsPage.tsx` — 重构 UI，增加申请列表
- **组件**: 所有加载用户列表的地方（ScanPage, QuickBillPage, AddBillOverlay, BillSheet）需改为加载好友列表
- **RLS**: 需要调整 users 表和 friendships 表的行级安全策略
