## Why

1. 现有的小票扫描功能是一个独立的静态 HTML 文件 (`receipt-scanner_final.html`)，与 React SPA 完全隔离。从 SPA 跳转到该文件会导致 404。需要迁移为 React 组件。
2. 添加"一句话生成账单"功能 — 用户输入一句自然语言描述（如"昨天和小明吃火锅花了 320"），调用 Claude API 自动解析出日期、金额、商品、成员等信息，生成可编辑的账单。

## What Changes

- 将 `receipt-scanner_final.html` 的全部功能迁移为 React 组件/页面
  - 图片上传（拖拽/点击选择）
  - 图片裁剪（canvas 四角拖拽透视变换）
  - 图片旋转
  - 调用 Supabase Edge Function（Claude AI 识别小票）
  - 识别结果展示与编辑（商品名、数量、价格）
  - 成员选择与分配（拖拽头像到商品行）
  - 保存为账单（上传图片、创建 bill + bill_items）
- **新增"一句话生成账单"功能**
  - AddBillOverlay 新增第三个按钮："💬 一句话生成"
  - 打开输入框，用户输入一句话描述
  - 调用 Claude API（通过 Supabase Edge Function），传入用户输入 + 当前日期 + 成员列表
  - Claude 返回结构化 JSON（icon、title、date、items、members 分配）
  - 展示可编辑的账单预览界面（复用扫描结果的编辑 UI）
  - 确认后保存为账单
- 新增 `/scan` 路由
- AddBillOverlay 的按钮改为导航到对应功能
- 复用现有 SPA 的 supabase client、useAuth、useBills 等

## Capabilities

### New Capabilities
- `receipt-scanner`: 小票扫描识别的完整 React 实现（上传、裁剪、OCR、编辑、分配、保存）
- `quick-bill`: 一句话生成账单（自然语言 → Claude 解析 → 可编辑账单 → 保存）

### Modified Capabilities

## Impact

- 新增 `src/pages/ScanPage.tsx` 及子组件
- 新增 `src/pages/QuickBillPage.tsx`（一句话生成）
- 新增 `src/lib/api/scan.ts`（Edge Function 调用 + prompt 构建）
- 修改 `src/App.tsx`（添加 /scan、/quick-bill 路由）
- 修改 `src/components/AddBillOverlay/AddBillOverlay.tsx`（三个按钮 + navigate）
- 可能需要新增或复用 Supabase Edge Function
- 可选：迁移完成后删除 `receipt-scanner_final.html`
