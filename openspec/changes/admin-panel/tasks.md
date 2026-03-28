## 1. 数据库

- [x] 1.1 创建 `admin_email_log` 表的 SQL migration（id, recipient_email, email_type, sent_at），启用 RLS，仅 admin 可读，Edge Function service role 可写

## 2. Edge Function: admin-ops

- [x] 2.1 创建 `supabase/functions/admin-ops/index.ts`，支持 `action` 参数：`list_users` / `generate_magic_link` / `get_email_stats`
- [x] 2.2 在 admin-ops 中验证 JWT 并提取 email，不是 `yiming4144@gmail.com` 则返回 403
- [x] 2.3 实现 `list_users`：调用 `supabase.auth.admin.listUsers()`，从 `public.users` 补充 name/emoji，返回合并结果
- [x] 2.4 实现 `generate_magic_link`：调用 `supabase.auth.admin.generateLink({ type: 'magiclink', email })`，返回 `action_link`
- [x] 2.5 实现 `get_email_stats`：查询 `admin_email_log` 最近 1 小时和 24 小时的发送次数，以及最近 20 条记录

## 3. Edge Function: send-email 更新

- [x] 3.1 在 `send-email` Edge Function 发送成功后，插入一条记录到 `admin_email_log`

## 4. 前端路由与页面框架

- [x] 4.1 在 `src/App.tsx` 中添加 `/admin` 路由，指向 `AdminPage`
- [x] 4.2 创建 `src/pages/AdminPage.tsx`，`useEffect` 中检查当前用户邮箱，非管理员重定向到 `/`
- [x] 4.3 创建 `src/lib/api/admin.ts`，封装调用 admin-ops Edge Function 的三个函数

## 5. 用户列表 UI

- [x] 5.1 在 `AdminPage` 中展示用户列表，每行显示 emoji、名字、邮箱、注册时间
- [x] 5.2 每行有"切换登录"按钮，点击调用 `generate_magic_link`，获取链接后 `window.location.href` 跳转

## 6. Email 统计 UI

- [x] 6.1 在 `AdminPage` 中展示 Email 统计区域：1小时/24小时发送数量，绿/黄/红指示灯
- [x] 6.2 展示最近 20 条发送记录列表（时间、收件人、类型）
- [x] 6.3 添加说明文字：Supabase 免费版限额为 3封/小时，且系统邮件（注册确认）不在此追踪范围内

## 7. 样式

- [x] 7.1 在 `global.css` 中添加管理员页面所需样式（admin-panel 布局、用户行、统计卡片、指示灯）

## 8. 构建验证

- [x] 8.1 运行 `npm run build` 确保无 TypeScript 错误
