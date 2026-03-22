## ADDED Requirements

### Requirement: BottomSheet 组件提供统一的底部弹窗容器

系统 SHALL 提供 `BottomSheet` 共享组件（`src/components/shared/BottomSheet.tsx`），封装 overlay 遮罩、framer-motion 滑入/滑出动画、handle 指示器、可选 titlebar 和 safe-area body。所有底部弹窗 MUST 使用此组件作为容器。

#### Scenario: 渲染基本弹窗
- **WHEN** 使用 `<BottomSheet onClose={fn}>内容</BottomSheet>` 渲染
- **THEN** 显示半透明遮罩（`rgba(0,0,0,0.5)`），弹窗从底部滑入，顶部显示 handle 指示器，内容区有 safe-area padding

#### Scenario: 点击遮罩关闭
- **WHEN** 用户点击遮罩区域
- **THEN** 触发 `onClose` 回调

#### Scenario: 点击弹窗内容不关闭
- **WHEN** 用户点击弹窗内容区域
- **THEN** 不触发 `onClose`（事件停止传播）

### Requirement: BottomSheet 动画参数统一

所有 BottomSheet 实例 SHALL 使用统一的动画参数：overlay 淡入 `duration: 0.28`，sheet 滑入 `duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94]`。

#### Scenario: 打开弹窗动画
- **WHEN** BottomSheet 挂载
- **THEN** 遮罩在 0.28s 内从透明淡入，弹窗在 0.4s 内从底部滑入（使用指定缓动曲线）

#### Scenario: 关闭弹窗动画
- **WHEN** BottomSheet 卸载
- **THEN** 遮罩淡出，弹窗向下滑出

### Requirement: BottomSheet 支持可选 titlebar

当传入 `title` prop 时，BottomSheet SHALL 显示标题栏（左侧取消按钮、中间标题、右侧自定义内容）。未传 `title` 时不显示标题栏。

#### Scenario: 带标题的弹窗
- **WHEN** 使用 `<BottomSheet title="编辑账单" headerRight={<button>保存</button>}>` 渲染
- **THEN** 显示标题栏：左侧"取消"按钮（触发 onClose）、中间"编辑账单"、右侧"保存"按钮

#### Scenario: 无标题的弹窗
- **WHEN** 使用 `<BottomSheet onClose={fn}>` 渲染（不传 title）
- **THEN** 不显示标题栏，直接显示 handle + body

### Requirement: BottomSheet 支持自定义 maxHeight 和 className

BottomSheet SHALL 支持 `maxHeight`（默认 `88vh`）和 `className`（附加到 sheet 元素）props。

#### Scenario: 自定义高度
- **WHEN** 使用 `<BottomSheet maxHeight="92vh">` 渲染
- **THEN** 弹窗最大高度为 92vh

#### Scenario: 附加 className
- **WHEN** 使用 `<BottomSheet className="detail-sheet">` 渲染
- **THEN** sheet 元素的 class 为 `"sheet detail-sheet"`
