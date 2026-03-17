## Overview

重构注册流程，将资料完善移到邮箱验证之后。使用 Supabase trigger 自动创建默认 public.users 记录。

## Registration Flow

```
[欢迎页] → [输入邮箱] → [设置密码] → signUp(email, password)
    → [验证邮件已发送] → 用户点击邮件链接
    → 重定向回 /login#access_token=...
    → onAuthStateChange 检测到登录
    → 查询 public.users，检查 profile_completed
    → 未完善 → [欢迎回来页] → [输入昵称] → [选头像+颜色]
              → upsert public.users + 标记 profile_completed
              → 跳转首页
    → 已完善 → 直接跳转首页
```

## Key Design Decisions

### 1. Profile 完善状态检测
在 public.users 表添加 `profile_completed boolean DEFAULT false` 字段。
- trigger 创建记录时 profile_completed = false
- 用户完善资料后设为 true
- App 层在 auth state change 时检查此字段

### 2. Supabase Trigger
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, emoji, color, profile_completed)
  VALUES (NEW.id, NEW.email, '新用户', '😀', '#1c1c26', false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
SECURITY DEFINER 绕过 RLS，确保即使用户无 session 也能插入。

### 3. LoginPage Step 变更
移除: signup-name, signup-emoji（移到验证后）
新增: setup-welcome, setup-name, setup-emoji（验证后显示）

### 4. signUp 简化
只传 email + password，不再传 name/emoji/color。

## Files Changed

| File | Change |
|------|--------|
| `src/lib/api/auth.ts` | signUp 移除 profile 参数，新增 `updateProfile()` |
| `src/pages/LoginPage.tsx` | 步骤重排，新增 setup 步骤 |
| `src/hooks/useAuth.ts` | 新增 profileCompleted 状态检测 |
| `src/components/Layout/Header.tsx` | 兼容默认值 |
| Supabase SQL | trigger + profile_completed 列 |
