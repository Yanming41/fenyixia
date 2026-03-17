## Overview

将 `receipt-scanner_final.html`（~2100 行 vanilla JS/HTML）迁移为 React 组件树，保留全部功能，融入 SPA 路由。

## Component Architecture

```
ScanPage (页面容器，管理整体 state machine)
├── ScanTypeSelector      选择小票类型（实体/数字）
├── ImageUploader         拖拽/点击上传图片
├── CropOverlay           全屏裁剪（canvas 四角拖拽）
├── ImagePreview          预览 + 旋转控制
├── MemberSelector        选择参与成员
├── ScanResult            识别结果展示
│   ├── ItemRow           单个商品行（可编辑）
│   └── MemberAssignment  成员分配（拖拽头像）
└── ScanSaveButton        保存为账单
```

## State Machine

```
type-select → upload → [crop] → preview → member-select → scanning → result → saving → done
                                                              │
                                                              └→ error (可重试)
```

## Key Design Decisions

### 1. 单页面 + 步骤式
整个扫描流程在 `/scan` 一个页面内完成，通过 state machine 控制当前步骤。不拆成多个路由，保持用户数据不丢失。

### 2. Canvas 裁剪逻辑
直接移植原有的透视变换算法（四角拖拽 → perspective transform → 输出 JPEG blob），封装到 `CropOverlay` 组件，用 useRef 操作 canvas。

### 3. API 调用
新建 `src/lib/api/scan.ts`：
- `scanReceipt(base64, mediaType, prompt)` → 调用 Supabase Edge Function
- `buildScanPrompt(type, members)` → 生成 Claude prompt
- `uploadReceiptImage(userId, blob)` → 上传到 receipt-images bucket

### 4. 成员拖拽分配
使用 touch/pointer events 实现拖拽，与原版逻辑一致。封装为 `useDragAssign` hook。

### 5. 保存流程
复用原有 `createBill` 逻辑（已在 `src/lib/api/bills.ts`），补充 receipt_scans 记录插入。

## Files

| File | Purpose |
|------|---------|
| `src/pages/ScanPage.tsx` | 页面容器 + state machine |
| `src/components/Scanner/ScanTypeSelector.tsx` | 类型选择 |
| `src/components/Scanner/ImageUploader.tsx` | 图片上传 |
| `src/components/Scanner/CropOverlay.tsx` | 裁剪覆盖层 |
| `src/components/Scanner/ImagePreview.tsx` | 预览 + 旋转 |
| `src/components/Scanner/MemberSelector.tsx` | 成员选择 |
| `src/components/Scanner/ScanResult.tsx` | 结果展示 + 编辑 |
| `src/components/Scanner/MemberAssignment.tsx` | 拖拽分配 |
| `src/lib/api/scan.ts` | Edge Function 调用 + prompt 构建 |
| `src/App.tsx` | 添加 /scan 路由 |
| `src/pages/QuickBillPage.tsx` | 一句话生成账单页面 |
| `src/components/AddBillOverlay/AddBillOverlay.tsx` | 三个按钮：手动、扫描、一句话 |
