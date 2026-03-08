## Context

新 SPA 基于 React 19 + TypeScript + Vite 6 + Supabase，使用 framer-motion 做动画。当前只有 2 个页面（HomePage, LoginPage），API 层完整（auth, bills, friends, payments, reactions），但缺少创建账单、好友管理、设置等关键 UI 页面。旧版（`app.js` 1252行 + `split-app.js` 424KB）包含完整功能但耦合严重。

## Goals / Non-Goals

**Goals:**
- 补齐核心用户交互：创建账单、好友管理、设置
- 建立完整的路由体系，所有 BottomNav tab 都有对应页面
- 从旧版迁移月份分组视图
- 复用现有 API 层，不修改后端逻辑

**Non-Goals:**
- 不迁移 OCR 扫描功能（独立迭代）
- 不迁移 SFX 音效系统（优先级低）
- 不重构现有组件（BillCardCarousel, SplitDetail 保持不变）
- 不修改 Supabase schema 或 RLS 策略

## Decisions

### 1. 创建账单使用 BottomSheet Modal 而非独立页面
- **选择**: Modal 覆盖在当前页面上
- **备选**: 独立的 `/create` 路由页面
- **理由**: 旧版用 overlay modal，用户已习惯；Modal 可保留首页状态；framer-motion 的 AnimatePresence 适合做 sheet 动画

### 2. 路由结构保持扁平
- **选择**: `/` `/friends` `/settings` `/login` 四条一级路由
- **备选**: 嵌套路由 `/app/home` `/app/friends` 等
- **理由**: 应用简单，不需要嵌套布局；BottomNav 对应一级路由更直观

### 3. 好友页面直接复用 `friends.ts` API
- **选择**: 直接在页面组件中调用 API
- **备选**: 创建 FriendsContext
- **理由**: 好友数据不需要跨页面共享，Context 增加不必要的复杂度

### 4. 月份分组视图作为 HomePage 的子视图
- **选择**: 在 HomePage 内切换"卡片轮播"和"月份分组"两种视图
- **备选**: 独立的 `/archive` 页面
- **理由**: 两种视图展示相同数据（bills），切换按钮在 Header 中比独立页面更自然

### 5. 组件样式使用 CSS-in-JS (inline styles + CSS 变量)
- **选择**: 沿用现有项目的 inline style + global.css 变量方式
- **备选**: CSS Modules, Tailwind
- **理由**: 保持与现有代码一致

## Risks / Trade-offs

- **[创建账单表单复杂度]** → 分步骤表单（选图标 → 填条目 → 选分摊人），每步独立验证
- **[月份分组性能]** → 账单数量有限（个人使用），不需要虚拟化
- **[好友搜索依赖邮箱]** → 沿用旧版设计，后续可加入邀请链接

## Open Questions

- Header 中切换视图的交互方式（tab 切换 vs 按钮 toggle）？
- 创建账单时是否需要选择日期（旧版默认当天）？
