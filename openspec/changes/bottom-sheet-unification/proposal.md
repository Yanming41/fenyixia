## Why

项目中所有底部弹窗（BillSheet、DisputeSheet、SplitDetail、AddBillOverlay）都各自实现了一套 AnimatePresence + motion.div 的 overlay/sheet 模板，导致动画参数不一致、safe-area padding 缺失、titlebar 风格不统一。之前 architecture-refactor 已明确要求提供共享的 `Modal` / `ActionSheet` 组件，但至今未落实。新增的 DisputeSheet 再次暴露了这个问题——按钮缩放异常、布局与其他弹窗不一致。

## What Changes

- 新建 `src/components/shared/BottomSheet.tsx` 共享底部弹窗组件，封装 overlay、motion 动画、handle、titlebar、body 和 safe-area 处理
- **重构** `BillSheet.tsx`：移除自行实现的 overlay/motion 模板，改用 `<BottomSheet>`
- **重构** `DisputeSheet.tsx`：移除自行实现的 overlay/motion 模板，改用 `<BottomSheet>`，修复按钮布局问题
- **重构** `SplitDetail.tsx`：移除自行实现的 overlay/motion 模板，改用 `<BottomSheet>`
- **重构** `AddBillOverlay.tsx`：移除 inline style overlay，改用 `<BottomSheet>`
- 清理 `global.css` 中重复的 overlay/sheet 基础样式，统一到 BottomSheet 内部

## Capabilities

### New Capabilities
- `bottom-sheet`: 共享底部弹窗组件的行为规范——Props 接口、动画参数、safe-area 处理、titlebar 可选显示

### Modified Capabilities
- `split-detail`: 弹窗容器改为使用共享 BottomSheet 组件，行为不变

## Impact

- 涉及文件：`BillSheet.tsx`、`DisputeSheet.tsx`、`SplitDetail.tsx`、`AddBillOverlay.tsx`、`global.css`
- 新增文件：`src/components/shared/BottomSheet.tsx`
- 依赖：framer-motion（已有）
- 无 API / 数据库变更
- 所有弹窗的视觉表现和交互行为保持一致
