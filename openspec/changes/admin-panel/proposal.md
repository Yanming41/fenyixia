## Why

需要一个管理员控制面板来：1) 在朋友注册遇到 email rate limit 时能手动帮助处理；2) 查看所有注册用户；3) 以任意用户身份登录排查问题。当前没有任何管理工具，只能通过 Supabase Dashboard 操作，效率低且不直观。

## What Changes

- 新增 `/admin` 路由，仅 `yiming4144@gmail.com` 可访问
- 管理员可查看所有注册用户列表（邮箱、名字、注册时间）
- 管理员可点击任意用户"切换登录"，生成一次性 magic link 并自动跳转到主页，以该用户身份使用 app
- Email 发送追踪面板：自建 `admin_email_log` 表记录每次发送的邮件类型和时间，面板展示最近 1 小时/24 小时的发送次数，并标注 Supabase 免费版限额（3封/小时，每天上限）
- 管理员可手动为用户重新发送确认邮件（在 rate limit 允许时）

## Capabilities

### New Capabilities
- `admin-auth`: 管理员身份验证和路由保护
- `admin-user-list`: 查看所有注册用户
- `admin-impersonate`: 以任意用户身份登录（magic link 方式）
- `admin-email-tracker`: 邮件发送追踪与 rate limit 可视化

### Modified Capabilities

## Impact

- `src/pages/AdminPage.tsx` — 新建管理员页面
- `src/App.tsx` — 新增 `/admin` 路由
- `supabase/functions/admin-ops/` — 新建 Edge Function，使用 service role key 执行管理员操作
- `supabase/migrations/` — 新建 `admin_email_log` 表
- `.env` — 需要配置 `SUPABASE_SERVICE_ROLE_KEY`（仅 Edge Function 侧使用，不暴露给前端）
