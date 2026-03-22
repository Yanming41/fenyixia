## 1. 创建 BottomSheet 共享组件

- [x] 1.1 创建 `src/components/shared/BottomSheet.tsx`，实现 Props 接口（onClose, title?, maxHeight?, className?, headerRight?, children）
- [x] 1.2 封装 AnimatePresence + overlay（transition 0.28s）+ motion.div sheet（ease curve `[0.25,0.46,0.45,0.94]`, duration 0.4s）+ handle + 可选 titlebar + sheet-body
- [x] 1.3 titlebar 内部：左侧"取消"按钮触发 onClose、中间 title、右侧 headerRight slot

## 2. 迁移 BillSheet

- [x] 2.1 移除 `BillSheet.tsx` 中的 AnimatePresence + overlay + motion.div 包装代码
- [x] 2.2 替换为 `<BottomSheet title={...} headerRight={保存按钮} maxHeight="92vh">`，内部只保留 sheet-body 内容

## 3. 迁移 DisputeSheet

- [x] 3.1 移除 `DisputeSheet.tsx` 中的 AnimatePresence + overlay + motion.div 包装代码
- [x] 3.2 替换为 `<BottomSheet title="⚖️ 质疑账单">`，内部只保留业务内容
- [x] 3.3 删除 global.css 中 `.dispute-sheet` 和 `.dispute-content` 的 maxHeight/padding 覆盖（由 BottomSheet 统一处理）
- [x] 3.4 修复 dispute-actions 按钮布局——使用与 BillSheet 一致的 padding 和 safe-area 处理

## 4. 迁移 SplitDetail

- [x] 4.1 移除 `SplitDetail.tsx` 中的 AnimatePresence + overlay + motion.div 包装代码
- [x] 4.2 替换为 `<BottomSheet className="detail-sheet" maxHeight="88vh">`（无 title，保留现有 detail-content 布局）

## 5. 迁移 AddBillOverlay

- [x] 5.1 移除 `AddBillOverlay.tsx` 中的 inline style overlay 代码
- [x] 5.2 替换为 `<BottomSheet>`（无 title），内部保留现有选项内容

## 6. CSS 清理

- [x] 6.1 确认 `.overlay`、`.sheet`、`.sh`、`.sheet-titlebar`、`.sheet-body` 基础样式保持不变
- [x] 6.2 删除各组件因重复实现产生的冗余样式（`.dispute-sheet` maxHeight、`.dispute-content` padding 等）
- [x] 6.3 验证所有弹窗的 safe-area padding 一致

## 7. 验证

- [x] 7.1 `npm run build` 通过，无 TypeScript 错误
- [x] 7.2 逐个验证每个弹窗的视觉表现和交互行为与迁移前一致
