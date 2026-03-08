## ADDED Requirements

### Requirement: 移除未使用的 Hook 模块
系统 SHALL 删除所有未被任何组件或页面导入的 hook 文件。

#### Scenario: useSfx hook 移除
- **WHEN** `src/hooks/useSfx.ts` 未被任何文件导入（音效功能已迁移到 `src/utils/sfx.ts` 单例）
- **THEN** 该文件 SHALL 被删除

#### Scenario: useResponsive hook 移除
- **WHEN** `src/hooks/useResponsive.ts` 未被任何文件导入
- **THEN** 该文件 SHALL 被删除

### Requirement: 移除未使用的组件
系统 SHALL 删除所有未被任何其他模块引用的组件目录。

#### Scenario: Modal 组件移除
- **WHEN** `src/components/Modal/` 目录中的组件未被任何文件导入（已被 BottomSheet 替代）
- **THEN** 整个 `src/components/Modal/` 目录 SHALL 被删除

### Requirement: 移除 TypeScript 声明文件
系统 SHALL 删除所有 Vite 和 CSS Module 的 TypeScript 类型声明文件。

#### Scenario: vite-env.d.ts 移除
- **WHEN** 项目不再使用 TypeScript
- **THEN** `src/vite-env.d.ts` SHALL 被删除
