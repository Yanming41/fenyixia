## ADDED Requirements

### Requirement: TypeScript 文件转换为 JavaScript
系统 SHALL 将所有 `src/` 下的 `.tsx` 文件重命名为 `.jsx`，`.ts` 文件重命名为 `.js`，并移除所有 TypeScript 特有语法（类型注解、接口、泛型、类型导入）。

#### Scenario: TSX 文件转换
- **WHEN** 存在一个 `.tsx` React 组件文件
- **THEN** 该文件 SHALL 被重命名为 `.jsx`，所有 `: Type` 注解、`interface`、`type` 声明被移除，JSX 内容保持不变

#### Scenario: TS 工具文件转换
- **WHEN** 存在一个非 React 的 `.ts` 文件（service、hook、util）
- **THEN** 该文件 SHALL 被重命名为 `.js`，类型注解被移除，运行时逻辑完全保留

#### Scenario: 类型定义文件处理
- **WHEN** 存在纯类型定义文件（`src/types/*.ts`）
- **THEN** 该文件 SHALL 被删除（类型信息通过 JSDoc 保留在使用处）

### Requirement: 构建配置适配
系统 SHALL 移除所有 TypeScript 构建配置，保留纯 JavaScript 的 Vite + React 配置。

#### Scenario: TypeScript 配置移除
- **WHEN** 项目根目录存在 `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- **THEN** 这些文件 SHALL 被删除

#### Scenario: Vite 配置转换
- **WHEN** `vite.config.ts` 存在
- **THEN** SHALL 被转换为 `vite.config.js`，内容保持功能等价

#### Scenario: 依赖清理
- **WHEN** `package.json` 包含 TypeScript 相关 devDependencies
- **THEN** `typescript`, `typescript-eslint`, `@types/react`, `@types/react-dom`, `@types/node` SHALL 被移除

### Requirement: JSDoc 类型文档
关键服务函数和 hook SHALL 使用 JSDoc `@param` / `@returns` 保留核心类型信息。

#### Scenario: Service 函数保留类型文档
- **WHEN** 一个 service 函数原来有 TypeScript 参数类型
- **THEN** SHALL 在函数上方添加 JSDoc 注释描述参数类型
