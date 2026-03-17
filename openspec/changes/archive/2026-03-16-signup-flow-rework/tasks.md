# Tasks

## 1. Database & Auth API

- [x] 1.1 Simplify `signUp()` in `auth.ts` — remove name/emoji/color params, only send email + password
- [x] 1.2 Add `updateProfile(name, emoji, color)` function in `auth.ts` — upserts public.users with profile_completed=true
- [x] 1.3 Add `checkProfileCompleted(userId)` function in `auth.ts` — queries public.users for profile_completed field

## 2. Auth Hook

- [x] 2.1 Update `useAuth` hook to expose `profileCompleted` state and `updateProfile` method
- [x] 2.2 On auth state change (SIGNED_IN), auto-check profile_completed and expose the result

## 3. LoginPage Rework

- [x] 3.1 Reorder signup steps: welcome → signup-email → signup-pin → verify-email (remove signup-name, signup-emoji from registration)
- [x] 3.2 Add setup-welcome step: "欢迎回来！您已完成邮箱验证" welcome message
- [x] 3.3 Add setup-name step: input nickname
- [x] 3.4 Add setup-emoji step: pick emoji + color (reuse existing UI)
- [x] 3.5 Wire setup completion: call updateProfile → navigate to home

## 4. App-level Profile Gate

- [x] 4.1 In App.tsx or routing logic, redirect authenticated users with profileCompleted=false to /login setup flow

## 5. Cleanup & Deploy

- [x] 5.1 Verify TypeScript compiles cleanly
- [x] 5.2 Commit with detailed message, merge to main, push
- [x] 5.3 Provide SQL for user to run (trigger + profile_completed column)
