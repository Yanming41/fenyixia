## 1. 项目脚手架搭建

- [x] 1.1 使用 Vite 初始化 React + TypeScript 项目，配置 `vite.config.ts`
- [x] 1.2 安装核心依赖：`react-router-dom`、`@supabase/supabase-js`
- [x] 1.3 创建项目目录结构：`src/services/`, `src/contexts/`, `src/hooks/`, `src/components/`, `src/pages/`, `src/types/`, `src/utils/`
- [x] 1.4 创建 `src/tokens.css` 全局 design tokens（颜色、字号、间距、圆角、阴影、动画时长）
- [x] 1.5 创建 `src/global.css` 全局基础样式（reset、字体、body 默认值、安全区域适配）

## 2. TypeScript 类型定义

- [x] 2.1 创建 `src/types/user.ts`：用户、好友相关类型
- [x] 2.2 创建 `src/types/bill.ts`：账单、条目、分摊人相关类型
- [x] 2.3 创建 `src/types/plugin.ts`：插件接口类型定义（预留，仅类型不实现）

## 3. 数据服务层

- [x] 3.1 创建 `src/services/supabase.ts`：Supabase client 初始化
- [x] 3.2 创建 `src/services/auth.ts`：认证服务（signUp, signIn, signOut, getCurrentUser, onAuthChange）
- [x] 3.3 创建 `src/services/bills.ts`：账单 CRUD（fetchMyBills, createBill, updateBill, deleteBill, toggleSettled, normalizeBill）
- [x] 3.4 创建 `src/services/friends.ts`：好友管理（getFriends, addFriend）
- [x] 3.5 创建 `src/services/reactions.ts`：怒气/凭证（addAnger, getUnseenAnger, markAngerSeen, uploadPaymentProof, getPaymentProofs）
- [x] 3.6 创建 `src/services/errors.ts`：统一错误处理（Supabase 错误 → 中文提示）

## 4. React Context 与状态管理

- [x] 4.1 创建 `src/contexts/AuthContext.tsx`：提供 useAuth() hook
- [x] 4.2 创建 `src/contexts/BillsContext.tsx`：提供 useBills() hook

## 5. 工具函数与常量

- [x] 5.1 创建 `src/utils/format.ts`：迁移 fmtMoney, fmtDate, fmtISODate, isoToMonthKey
- [x] 5.2 创建 `src/utils/constants.ts`：迁移 ICON_COLORS, BILL_COLORS 等常量

## 6. 核心 Hooks

- [x] 6.1 创建 `src/hooks/useCarousel.ts`：封装卡片轮播引擎（frac, current, snapTo, drag 手势, 惯性, RAF 节流）
- [x] 6.2 创建 `src/hooks/useSfx.ts`：封装音效引擎
- [x] 6.3 创建 `src/hooks/useResponsive.ts`：响应式工具 hook

## 7. UI 组件库

- [x] 7.1 创建 `src/components/BillCard/`：账单卡片组件
- [x] 7.2 创建 `src/components/BillCardCarousel/`：卡片轮播组件
- [x] 7.3 创建 `src/components/BottomNav/`：底部导航栏组件（路由联动）
- [x] 7.4 创建 `src/components/Modal/`：Modal + ActionSheet 组件
- [x] 7.5 创建 `src/components/FormGroup/`：表单控件组件
- [x] 7.6 创建 `src/components/Toast/`：Toast 通知组件
- [x] 7.7 创建 `src/components/Header/`：顶部导航栏组件
- [x] 7.8 创建 `src/components/SummaryCards/`：汇总卡片组件

## 8. SPA 路由与页面

- [x] 8.1 创建 `src/App.tsx`：根组件 + React Router 配置
- [x] 8.2 创建 `src/components/AuthGuard.tsx`：认证路由守卫
- [x] 8.3 创建 `src/pages/LoginPage/`：登录/注册流程
- [x] 8.4 创建 `src/pages/HomePage/`：主界面（Header + 汇总 + 卡片轮播）
- [x] 8.5 创建 `src/pages/BillDetailPage/`：账单详情页面
- [x] 8.6 创建 `src/pages/ScanPage/`：OCR 扫描页面
- [x] 8.7 创建 `src/pages/MembersPage/`：成员管理页面
- [x] 8.8 创建 `src/pages/SettingsPage/`：设置页面（预留骨架）
- [x] 8.9 创建 `src/pages/NotFoundPage/`：404 页面

## 9. 移动端适配

- [x] 9.1 审查所有组件 CSS，确保移动端优先（375px 基准）
- [x] 9.2 确保所有可交互元素触摸目标 ≥ 44×44px
- [x] 9.3 使用 clamp() 设置响应式字号
- [x] 9.4 平板适配：内容区居中，最大宽度 480px

## 10. 旧文件迁移与清理

- [x] 10.1 将旧文件移动到 `legacy/` 目录
- [x] 10.2 更新项目入口为 Vite 构建的 `index.html`
- [x] 10.3 验证 `npm run dev` 可正常启动
