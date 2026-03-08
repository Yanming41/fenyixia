## Why

项目在 architecture-refactor 中引入了 TypeScript，但团队决定回退到 JavaScript 以降低维护门槛。同时在代码审查中发现了死代码、遗留文件散落等问题需要清理。

## What Changes

- 将所有 `.tsx` / `.ts` 源文件转换为 `.jsx` / `.js`，移除类型注解
- 移除 TypeScript 配置文件（`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`）及相关 devDependencies
- 删除死代码：`src/hooks/useSfx.ts`, `src/hooks/useResponsive.ts`, `src/components/Modal/`
- 将根目录散落的 SQL 文件整理到 `db/` 目录
- 清理根目录遗留的 `styles.css`
- 更新 Vite 配置以适配纯 JS 项目

## Capabilities

### New Capabilities
- `js-migration`: TypeScript → JavaScript 全量迁移，保持功能完全一致
- `dead-code-cleanup`: 识别并移除未使用的模块和组件
- `project-hygiene`: 根目录文件整理，SQL 归类

### Modified Capabilities
_(无现有 spec 需要修改)_

## Impact

- **源代码**：所有 `src/` 下的 `.tsx`/`.ts` 文件将变为 `.jsx`/`.js`
- **构建配置**：`vite.config.ts` → `vite.config.js`，移除 tsconfig 系列
- **依赖**：移除 `typescript`, `typescript-eslint`, `@types/*` 等 devDependencies
- **ESLint**：简化配置，移除 TS 相关插件
- **功能**：零功能变更，纯重构
