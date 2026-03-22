## Context

项目中有 5 个组件各自实现底部弹窗，代码重复且参数不一致：
- `BillSheet.tsx` — framer-motion sheet，overlay transition 0.28s
- `DisputeSheet.tsx` — framer-motion sheet，缺少 overlay transition，无 titlebar
- `SplitDetail.tsx` — framer-motion sheet，className `detail-sheet`
- `AddBillOverlay.tsx` — 纯 inline styles，无动画
- `MemberPickerSheet.tsx` — 不是真正的 sheet，是嵌入式容器，不在本次重构范围内

所有 framer-motion 实现共用相同的动画曲线 `[0.25, 0.46, 0.45, 0.94]`、duration `0.4s`，但每个组件都手动复制这些参数。

## Goals / Non-Goals

**Goals:**
- 创建 `BottomSheet` 共享组件，封装 overlay + motion + handle + titlebar + body + safe-area
- 将 BillSheet、DisputeSheet、SplitDetail、AddBillOverlay 全部迁移到 `<BottomSheet>`
- 统一动画参数、safe-area padding、maxHeight 处理
- 修复 DisputeSheet 按钮布局和缩放问题

**Non-Goals:**
- 不重构 MemberPickerSheet（它是嵌入式组件，不是独立弹窗）
- 不增加手势下拉关闭（可以未来做）
- 不改变任何弹窗的业务逻辑

## Decisions

### 1. BottomSheet Props 接口

```tsx
interface BottomSheetProps {
  open?: boolean           // 控制显隐，默认 true（兼容现有用法）
  onClose: () => void
  title?: string           // 有 title 时显示 titlebar
  maxHeight?: string       // 默认 '88vh'
  className?: string       // 附加 class（如 detail-sheet 的自定义样式）
  headerRight?: ReactNode  // titlebar 右侧按钮（如"保存"）
  children: ReactNode
}
```

**为什么：** 用可选 `title` 控制 titlebar 显隐，避免布尔 `showTitleBar` + 单独 `title` 两个 prop。`headerRight` 允许 BillSheet 放保存按钮。

### 2. 组件内部结构

```
<AnimatePresence>
  <motion.div className="overlay">        ← 统一 transition 0.28s
    <motion.div className="sheet {className}"> ← 统一动画曲线
      <div className="sh" />               ← handle
      {title && <Titlebar />}              ← 可选
      <div className="sheet-body">         ← safe-area padding
        {children}
      </div>
    </motion.div>
  </motion.div>
</AnimatePresence>
```

### 3. CSS 清理策略

保留 `.overlay`、`.sheet`、`.sh`、`.sheet-titlebar`、`.sheet-body` 基础样式不变。删除各组件自定义的 overlay/sheet 样式（如 `.dispute-sheet` 的 maxHeight、`.dispute-content` 的 padding），由 BottomSheet 内部统一处理。各组件特有的内容样式（如 `.dispute-items`、`.detail-header`）保留。

### 4. 迁移策略——逐文件替换

每个组件单独迁移：移除 AnimatePresence + overlay + motion.div 包装，替换为 `<BottomSheet>`。内部业务代码不变，只改外层容器。这样每步改动都可独立验证。

## Risks / Trade-offs

- **[风险] 迁移遗漏样式差异** → 每个组件迁移后对比前后 maxHeight、padding，确保视觉一致
- **[风险] AddBillOverlay 无动画 → 有动画** → 这是改进，但需确认用户体验可接受
- **[取舍] open prop 默认 true** → 兼容现有条件渲染 `{show && <BottomSheet>}` 的用法，未来可改为 prop 控制
