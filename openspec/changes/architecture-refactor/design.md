## Context

> **用户反馈更新**: 使用 TypeScript；插件系统延后迭代；旧文件移至 `legacy/`

「分一下」是一个面向室友的 AA 分账应用，当前由 3 个独立 HTML 页面组成：

- `create-user.html` — 注册/登录流程（1830 行，内联全部 CSS+JS）
- `aa-split-v4.html` — 主界面（引用 `split-app.js` 42 万字符 + `split-styles.css` 4.6 万字符）
- `receipt-scanner_final.html` — 小票 OCR 扫描（2164 行，内联全部 CSS+JS）

后端使用 Supabase（PostgreSQL + Auth + Storage + RLS），通过 `supabase.js`（501 行）封装为全局 `window.DB` 对象。

核心问题：
1. 页面间无路由，靠 `window.location` 跳转、状态丢失
2. 轮播卡片动画引擎直接操作 DOM + RAF，与 UI 逻辑高度耦合
3. CSS 无统一体系，各页面各自定义 `--bg`、`--surface` 等变量，值不一致
4. 无构建流程，`split-app.js` 已膨胀至 42 万字符无法维护
5. 移动端适配仅靠 `meta viewport` + 部分 `env(safe-area-inset-*)`
6. 无任何扩展机制

## Goals / Non-Goals

**Goals:**
- 建立 Vite + React SPA 架构，统一构建、开发、部署流程
- 用 React Router 实现声明式路由，保留完整导航状态
- 将 Supabase 调用抽象为独立 service 层，通过 React Context 注入
- 建立 design token + 组件库，确保移动端优先的一致性体验
- 将卡片轮播手势引擎封装为独立 hook/组件，可脱离业务逻辑复用
- 预留 Plugin API 接口（首期不实现完整插件系统，仅定义类型和基础注册结构，具体实现留给后续迭代）

**Non-Goals:**
- 不更改 Supabase schema 或 RLS 策略（后端不变）
- 不引入 SSR/SSG（保持纯客户端 SPA）
- 不做原生 App 封装（PWA 可在后续考虑）
- 不重新设计 UI 视觉风格（保持现有设计语言）

## Decisions

### D1: 构建工具选择 Vite + React + TypeScript

**选择**: Vite 6 + React 19 + TypeScript 5
**备选**: Next.js / Remix / 纯 Webpack

**理由**:
- 项目是纯客户端 SPA，不需要 SSR，Next.js/Remix 过重
- TypeScript 提供类型安全，对服务层接口和插件 API 定义尤其重要
- Vite 启动速度快、HMR 即时，适合快速开发
- React 生态成熟，组件化天然适配现有 UI 结构
- 直接部署 `dist/` 到静态托管（Vercel/Netlify/GitHub Pages）

### D2: 路由方案选择 React Router v7

**选择**: React Router v7（data router 模式）
**备选**: TanStack Router / 自写 hash router

**理由**:
- 支持 loader/action 数据加载模式，路由级别预加载数据
- 社区最广泛，文档完善
- 支持嵌套路由，适合 tab-bar + 子页面结构

**路由结构**:
```
/login          → 登录/注册流程
/               → 主页（卡片轮播 + 汇总）
/bills/:id      → 账单详情
/scan           → 小票 OCR 扫描
/members        → 成员管理
/stats          → 统计（预留）
/settings       → 设置（预留）
```

### D3: 状态管理使用 React Context + useReducer

**选择**: React Context + useReducer（不引入 Redux/Zustand）
**备选**: Zustand / Jotai / Redux Toolkit

**理由**:
- 应用状态结构清晰（用户、账单列表、好友），不需要复杂中间件
- Context 足以覆盖全局状态共享需求
- 减少依赖，保持简单
- 未来如有需要可平滑迁移到 Zustand

### D4: 样式方案选择 CSS Modules + CSS 变量

**选择**: CSS Modules + 全局 CSS 变量 (design tokens)
**备选**: Tailwind CSS / styled-components / Emotion

**理由**:
- CSS Modules 自动作用域隔离，Vite 原生支持，零配置
- 全局 CSS 变量定义 design tokens（颜色、字号、间距、阴影），各组件引用
- 保留对原始 CSS 的掌控力，动画性能优于 CSS-in-JS
- 卡片轮播的高性能动画需要直接操作 style.transform，CSS Modules 不阻碍

### D5: 卡片轮播引擎封装为自定义 Hook

**选择**: 将 `render()`/`snapTo()`/`onDrag*()` 提取为 `useCarousel` hook
**方案**:
- Hook 管理 `frac`（滑动位置）、`current`（当前卡片）、手势状态
- 通过 `ref` 直接操作卡片 DOM 元素（绕过 React 虚拟 DOM，保证 60fps）
- 暴露 `{ containerRef, frac, current, snapTo, cardStyle(index) }` 接口
- 音效引擎独立为 `useSfx` hook

### D6: 插件系统设计（延后迭代，首期仅定义类型）

**选择**: 基于注册表 (Registry) 的插件架构，首期仅定义 TypeScript 类型接口
**方案**:

首期交付：
- 定义 `PluginDefinition` TypeScript 接口类型
- 创建 `src/plugins/types.ts`，导出所有插件相关类型
- 不实现完整的 PluginManager，留给后续迭代

未来迭代将实现：
1. **路由扩展** — 插件注册新页面
2. **菜单扩展** — 插件添加菜单项
3. **账单中间件** — 创建账单前/后的钩子
4. **卡片装饰器** — 卡片渲染时注入自定义装饰

### D7: 项目目录结构

```
src/
├── main.tsx                   # 入口
├── App.tsx                    # 根组件 + 路由
├── tokens.css                 # 全局 design tokens
├── global.css                 # 全局基础样式
├── services/                  # 数据服务层
│   ├── supabase.ts            # Supabase client 初始化
│   ├── auth.ts                # 认证服务
│   ├── bills.ts               # 账单 CRUD
│   ├── friends.ts             # 好友管理
│   ├── reactions.ts           # 怒气/凭证
│   └── errors.ts              # 统一错误处理
├── contexts/                  # React Context
│   ├── AuthContext.tsx
│   └── BillsContext.tsx
├── hooks/                     # 自定义 Hooks
│   ├── useCarousel.ts         # 卡片轮播引擎
│   ├── useSfx.ts              # 音效引擎
│   └── useResponsive.ts       # 响应式工具
├── types/                     # TypeScript 类型定义
│   ├── bill.ts
│   ├── user.ts
│   └── plugin.ts              # 插件接口（预留）
├── components/                # 可复用组件
│   ├── BillCard/
│   ├── BottomNav/
│   ├── Modal/
│   ├── FormGroup/
│   └── ...
├── pages/                     # 页面组件
│   ├── LoginPage/
│   ├── HomePage/
│   ├── ScanPage/
│   ├── MembersPage/
│   └── ...
└── utils/                     # 工具函数
    ├── format.ts              # fmtMoney, fmtDate 等
    └── constants.ts           # 颜色映射、默认配置
```

## Risks / Trade-offs

**[卡片动画性能]** → 封装为 hook 后通过 `ref` 直接操作 DOM，绕过 React 调和算法。测试需在真机上验证帧率不退化。

**[迁移完整性]** → `split-app.js` 有 42 万字符，需逐功能模块迁移。通过分阶段迁移 + 每阶段功能对比测试降低风险。

**[插件 API 稳定性]** → 初版 Plugin API 接口可能需要迭代。标记为 `experimental`，保持最小接口先上线。

**[学习曲线]** → 从纯 JS/HTML 迁移到 React 需要团队适应。通过渐进式迁移缓解。

**[部署变更]** → 从直接托管 HTML 改为需要 build 步骤。Vite build 输出到 `dist/`，可部署到任何静态托管。
