# Tasks

## 1. API Layer

- [x] 1.1 Create `src/lib/api/scan.ts` with `scanReceipt(base64, mediaType, prompt)` function calling Supabase Edge Function
- [x] 1.2 Add `buildScanPrompt(type, members)` function (port prompt logic from original HTML)
- [x] 1.3 Add `uploadReceiptImage(userId, blob, ext)` function for receipt-images bucket upload
- [x] 1.4 Add `insertReceiptScan(userId, imagePath, scanResult, billId)` function

## 2. Image Processing Components

- [x] 2.1 Create `src/components/Scanner/ImageUploader.tsx` — drag-drop + click to upload, file validation
- [x] 2.2 Create `src/components/Scanner/CropOverlay.tsx` — fullscreen canvas, corner detection, 4-point drag, perspective transform, skip option
- [x] 2.3 Create `src/components/Scanner/ImagePreview.tsx` — image preview with 90°/180°/270° rotation controls

## 3. UI Components

- [x] 3.1 Create `src/components/Scanner/ScanTypeSelector.tsx` — choose physical receipt vs digital order
- [x] 3.2 Create `src/components/Scanner/MemberSelector.tsx` — fetch users, toggle selection, minimum 1
- [x] 3.3 Create `src/components/Scanner/ScanResult.tsx` — display parsed receipt, inline edit items, delete items, recalculate totals
- [x] 3.4 Create `src/components/Scanner/MemberAssignment.tsx` — drag-drop member avatars to item rows, toggle assignment, per-person amount display

## 4. Page & Routing

- [x] 4.1 Create `src/pages/ScanPage.tsx` — state machine (type-select → upload → crop → preview → members → scanning → result → done), wire all components
- [x] 4.2 Add `/scan` route to `src/App.tsx` under ProtectedRoute
- [x] 4.3 Update `AddBillOverlay.tsx` — replace `window.location.href` with `useNavigate()` to `/scan`

## 5. Save Flow

- [x] 5.1 Wire save button: upload image → create bill + items → insert receipt_scan → toast → navigate home

## 6. Quick Bill (一句话生成账单)

- [x] 6.1 Add `buildQuickBillPrompt(text, currentDate, members)` to `src/lib/api/scan.ts` — generate Claude prompt for natural language → bill JSON
- [x] 6.2 Create `src/pages/QuickBillPage.tsx` — text input, call Edge Function, show loading, display result
- [x] 6.3 Reuse `ScanResult` + `MemberAssignment` components for editing the generated bill
- [x] 6.4 Wire save: create bill + items → toast → navigate home
- [x] 6.5 Add `/quick-bill` route to `src/App.tsx` under ProtectedRoute
- [x] 6.6 Update `AddBillOverlay.tsx` — add "💬 一句话生成" button navigating to `/quick-bill`

## 7. Styling

- [x] 7.1 Add scanner + quick-bill CSS to `global.css` (port essential styles, adapt to existing design system)

## 8. Verification

- [x] 8.1 Verify TypeScript compiles cleanly
- [ ] 8.2 Test scan flow: type select → upload → crop → preview → scan → edit → assign → save
- [ ] 8.3 Test quick-bill flow: input text → generate → edit → save
