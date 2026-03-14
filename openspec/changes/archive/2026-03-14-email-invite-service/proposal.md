## Why

当前系统存在两个问题：（1）注册无邮箱验证，任何人填写任意邮箱即可注册，无法保证邮箱所有权；（2）添加好友时如果对方不在系统中，只能报错"找不到该用户"，没有邀请机制。需要一个模块化的邮件服务（Supabase Edge Function + Resend API）来支撑这两个场景，并为未来扩展（账单通知、催款提醒等）打好基础。

## What Changes

- **新增 Edge Function `send-email`**：通用邮件发送函数，接收模板类型 + 参数，调用 Resend API 投递
- **注册邮箱验证**：注册后发送验证邮件，用户点击链接完成验证。未验证用户限制功能访问
- **好友邀请邮件**：添加好友时若邮箱不在系统中，自动发送邀请邮件（包含注册链接）
- **新建 `invitations` 数据库表**：记录邀请人、被邀请邮箱、状态（pending/accepted/expired）
- **修改 `addFriend()` 逻辑**：从"找不到即报错"改为"找不到则发邀请"

## Capabilities

### New Capabilities
- `email-service`: 通用邮件发送 Edge Function，支持多种邮件模板（验证、邀请等）
- `email-verification`: 注册时发送验证邮件，验证后激活账户
- `friend-invitation`: 添加好友时如果对方不在系统中，发送邮件邀请注册

### Modified Capabilities
（无已有 specs 需要修改）

## Impact

- **新增依赖**：Resend API（需注册账号并配置 API Key 到 Supabase secrets）
- **新增 Edge Function**：`supabase/functions/send-email/index.ts`
- **数据库变更**：新建 `invitations` 表
- **修改文件**：`src/lib/api/auth.ts`（注册流程）、`src/lib/api/friends.ts`（好友添加流程）、`src/pages/FriendsPage.tsx`（UI 反馈）
- **Supabase Auth 配置**：可能需要调整 Supabase 自带的邮箱确认设置以避免与自定义验证冲突
