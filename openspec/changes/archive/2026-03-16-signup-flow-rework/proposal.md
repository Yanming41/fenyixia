## Why

当前注册流程在 signUp 后立即 upsert public.users，但此时邮箱尚未验证、用户无有效 session，导致 RLS 拒绝写入，public.users 缺记录，登录后头像显示"加载中"。需要重构流程：先注册+验证邮箱，验证回来后再完善资料（名字、头像、颜色）。

## What Changes

- 注册步骤重排：email → password → 发送验证 → 用户点击邮件链接回来 → 显示欢迎页 → 完善资料（名字、emoji、颜色）
- signUp 不再传 name/emoji/color，只传 email + password
- 验证回调后检测用户是否已完善资料，未完善则引导至 profile setup 流程
- 添加 Supabase trigger：auth.users 新增时自动在 public.users 创建默认记录
- Header 等组件兼容"未完善资料"状态（默认头像）

## Capabilities

### New Capabilities
- `profile-setup`: 邮箱验证后的资料完善流程（欢迎页 + 选名字 + 选头像）

### Modified Capabilities
- `auth-flow`: 注册步骤重排，signUp 只传 email+password，验证后引导完善资料

## Impact

- `src/pages/LoginPage.tsx` — 注册步骤重排 + 新增 setup 步骤
- `src/lib/api/auth.ts` — signUp 移除 name/emoji/color 参数
- `src/hooks/useAuth.ts` — 检测 profile 完善状态
- `src/components/Layout/Header.tsx` — 兼容默认 profile
- Supabase SQL — 新增 trigger function
