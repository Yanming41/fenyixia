## Context

项目刚完成 architecture-refactor（Vite + React + TypeScript SPA），但团队决定回退到 JavaScript。同时代码审查发现死代码和根目录散乱文件。当前状态：78 个源文件，~5670 行，全部 `.tsx`/`.ts`。

## Goals / Non-Goals

**Goals:**
- 将所有 `.tsx`/`.ts` 转为 `.jsx`/`.js`，移除类型注解
- 移除 TypeScript 工具链（tsconfig, @types/*, typescript 依赖）
- 删除 3 个已确认的死代码模块
- 将 SQL 文件归类到 `db/` 目录
- 清理根目录遗留 `styles.css`

**Non-Goals:**
- 不修改任何业务逻辑
- 不添加新功能
- 不修改 Supabase schema
- 不迁移 legacy/ 下的旧文件

## Decisions

### 1. TS → JS 转换策略
**选择**: 逐文件手动移除类型注解 + 重命名
**原因**: 文件量不大（~78 文件），机械转换确保代码逐行可对照。不使用自动化工具（如 `ts-to-js`）避免引入格式变化。
**替代方案**: 用 `tsc --outDir` 编译输出 → 会丢失 JSX 和格式

### 2. 类型信息保留
**选择**: 在关键函数上方用 JSDoc `@param` / `@returns` 保留核心类型文档
**原因**: 完全删除类型信息会降低可读性，JSDoc 兼容 VS Code IntelliSense

### 3. Vite 配置
**选择**: `vite.config.ts` → `vite.config.js`，保持 `@vitejs/plugin-react`
**原因**: Vite 原生支持 `.jsx` 文件，插件无需变化

### 4. ESLint 配置
**选择**: 移除 `typescript-eslint`，保留基础 ESLint + react-hooks + react-refresh
**原因**: 无 TS 就不需要 TS lint 规则

### 5. SQL 文件组织
**选择**: 创建 `db/` 目录，移入所有 `.sql` 文件
**原因**: 清晰分离数据库相关文件

## Risks / Trade-offs

- **丢失类型安全** → 用 JSDoc 部分弥补，未来可考虑 JSDoc + `@ts-check`
- **转换遗漏** → 每个文件转换后确认 Vite 构建通过
- **import 路径变更** → `.ts`/`.tsx` → `.js`/`.jsx`，Vite 无扩展名 import 不受影响
