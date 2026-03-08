## Why

当前「分一下」项目由多个独立 HTML 文件组成（`aa-split-v4.html`、`create-user.html`、`receipt-scanner_final.html`），每个页面各自内联数万行 CSS + JS，没有共享模块、没有路由、没有构建流程。移动端适配靠各页面单独写 media query，不一致且覆盖不全。前后端（Supabase）调用散落在各处，无法统一错误处理或缓存。这使得维护成本极高，新功能无法复用已有组件，第三方也没有任何途径扩展功能。

现在重构是因为核心功能已稳定（认证、账单 CRUD、OCR、怒气系统），需要在此基础上建立可持续的工程架构，才能高效迭代后续功能（统计、群组、通知等）。

## What Changes

- **引入 Vite + React 构建体系**：替换多个独立 HTML 为单页应用 (SPA)，统一构建、打包、热更新
- **前端路由**：使用 React Router 管理页面导航（登录 → 主页 → 小票扫描 → 统计等）
- **数据层重构**：将 `supabase.js` 拆分为独立 service 模块（auth、bills、friends、reactions），通过 React Context 或状态管理库统一提供
- **UI 组件库**：提取可复用组件（卡片轮播、底部导航、Modal、表单控件等），用 CSS Modules 或 styled-components 隔离样式
- **移动端优先响应式**：建立全局 design token 体系（间距、字号、颜色），用 CSS 变量 + 容器查询实现一致的移动端适配
- **插件系统**：设计 Plugin API 接口，允许第三方通过注册钩子 (hooks) 来扩展页面、菜单项、账单处理管道等
- **BREAKING**：现有 HTML 文件将被弃用，所有页面迁移到 React 组件中

## Capabilities

### New Capabilities
- `spa-routing`: 前端 SPA 路由管理，定义页面结构与导航流
- `data-service-layer`: 前后端解耦的数据服务层，统一 Supabase 调用、错误处理、缓存策略
- `ui-component-library`: 可复用 UI 组件库及 design token 体系
- `responsive-mobile`: 移动端优先的响应式布局系统
- `plugin-system`: 第三方插件注册与扩展接口

### Modified Capabilities
_(无现有 spec 需要修改)_

## Impact

- **代码结构**：整个前端代码从多个独立 HTML/JS/CSS 重写为 `src/` 目录下的 React 项目结构
- **构建工具**：新增 `package.json`、Vite 配置、ESLint 等工程化配置
- **部署**：从直接托管 HTML 文件改为构建产物（`dist/`）部署，需更新部署流程
- **后端**：Supabase schema 和 RLS 策略不变，仅前端调用方式重构
- **依赖新增**：React, React Router, Vite, 及相关开发工具链
- **迁移风险**：原有卡片轮播动画引擎（自定义 DOM 操作 + RAF）需要适配到 React 生命周期中，是最大技术风险点
