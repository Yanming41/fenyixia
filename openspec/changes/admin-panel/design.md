## Context

项目是 React SPA + Supabase 后端。目前有两个 Edge Functions（scan-receipt, send-email）。管理员操作需要 Supabase service role key，该 key 拥有绕过 RLS 的权限，**绝对不能暴露在前端代码中**，只能在 Edge Function 里使用。

Supabase 的 email rate limit（免费版：3封/小时，每日上限 ~50封）没有公开 API 可查询，需要自建追踪机制。

## Goals / Non-Goals

**Goals:**
- 管理员页面仅限 `yiming4144@gmail.com`，前端做第一层检查，Edge Function 做第二层验证
- 用户列表通过 Edge Function 调用 `supabase.auth.admin.listUsers()` 获取
- 切换用户通过 Edge Function 调用 `supabase.auth.admin.generateLink({ type: 'magiclink' })` 生成链接，前端打开后自动登录
- Email 追踪：每次 send-email Edge Function 被调用时写入 `admin_email_log` 表

**Non-Goals:**
- 不做精细权限管理（只有一个管理员）
- 不做用户封禁/删除（避免误操作）
- 不实时同步 Supabase 官方 rate limit 计数器

## Decisions

### 1. 单一 Edge Function `admin-ops`

所有管理员操作（list users, generate magic link, get email stats）通过一个 Edge Function `admin-ops` 处理，用 `action` 参数区分操作类型。

**安全验证**：Edge Function 先验证请求者的 JWT，提取 email，不是 `yiming4144@gmail.com` 则直接 403。

**替代方案**: 多个单独的 Edge Function → 更多部署和维护开销，单个足够。

### 2. 切换用户：Magic Link 方式

调用 `supabase.auth.admin.generateLink({ type: 'magiclink', email: targetEmail })` 获取一次性登录链接。前端拿到链接后，用 `window.location.href = link` 跳转，Supabase 会自动完成登录并重定向到主页。

**安全性**：Magic link 一次性有效，5 分钟过期，不会留下持久凭据。

### 3. Email 追踪表

新增 `admin_email_log` 表：
```sql
id, recipient_email, email_type, sent_at
```

在 `send-email` Edge Function 里，每次发邮件成功后写入该表。管理员页面查询最近记录来展示发送频率。

### 4. 前端路由保护

`AdminPage` 组件在 `useEffect` 里检查 `auth.user().email`，不匹配则重定向到 `/`。Edge Function 做第二层验证确保安全。

## Risks / Trade-offs

- **Magic link 安全性**: 生成 magic link 的操作极其敏感，任何人调用 admin-ops 且伪造 JWT 就能拿到别人的登录链接 → 由 Edge Function JWT 验证 + 管理员邮箱白名单双重防护
- **Email 追踪不完整**: 只追踪通过 send-email Edge Function 发的邮件，Supabase 自动发的验证邮件（注册时）不在追踪范围内 → 面板上注明此限制
