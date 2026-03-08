## 1. 死代码清理

- [ ] 1.1 删除 `src/hooks/useSfx.ts`
- [ ] 1.2 删除 `src/hooks/useResponsive.ts`
- [ ] 1.3 删除 `src/components/Modal/` 目录（3 个文件）
- [ ] 1.4 删除 `src/vite-env.d.ts`
- [ ] 1.5 删除 `src/types/` 目录（`user.ts`, `bill.ts`, `plugin.ts`）

## 2. 根目录文件整理

- [ ] 2.1 创建 `db/` 目录
- [ ] 2.2 移动 `supabase-schema.sql`, `fix-rls-insert.sql`, `fix-rls-recursion.sql`, `receipt-scans-schema.sql` 到 `db/`
- [ ] 2.3 移动 `styles.css` 到 `legacy/`

## 3. TypeScript 配置移除

- [ ] 3.1 删除 `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- [ ] 3.2 `vite.config.ts` → `vite.config.js`（移除类型导入）
- [ ] 3.3 `eslint.config.js` 移除 `typescript-eslint` 相关配置
- [ ] 3.4 `package.json` 移除 TS devDependencies（`typescript`, `typescript-eslint`, `@types/*`）
- [ ] 3.5 运行 `npm install` 清理 lock 文件

## 4. 服务层 TS→JS 转换（src/services/）

- [ ] 4.1 `supabase.ts` → `supabase.js`
- [ ] 4.2 `auth.ts` → `auth.js`（移除类型注解，加 JSDoc）
- [ ] 4.3 `bills.ts` → `bills.js`
- [ ] 4.4 `friends.ts` → `friends.js`
- [ ] 4.5 `reactions.ts` → `reactions.js`
- [ ] 4.6 `errors.ts` → `errors.js`

## 5. Context 层 TS→JS 转换（src/contexts/）

- [ ] 5.1 `AuthContext.tsx` → `AuthContext.jsx`
- [ ] 5.2 `BillsContext.tsx` → `BillsContext.jsx`

## 6. Hooks 层 TS→JS 转换（src/hooks/）

- [ ] 6.1 `useCarousel.ts` → `useCarousel.js`

## 7. 工具层 TS→JS 转换（src/utils/）

- [ ] 7.1 `format.ts` → `format.js`
- [ ] 7.2 `constants.ts` → `constants.js`
- [ ] 7.3 `sfx.ts` → `sfx.js`
- [ ] 7.4 `fpsMonitor.ts` → `fpsMonitor.js`
- [ ] 7.5 `audio.ts` → `audio.js`

## 8. 组件层 TS→JS 转换（src/components/）

- [ ] 8.1 `AuthGuard.tsx` → `AuthGuard.jsx`
- [ ] 8.2 `BillCard/BillCard.tsx` → `BillCard.jsx` + `index.ts` → `index.js`
- [ ] 8.3 `BillCardCarousel/BillCardCarousel.tsx` → `.jsx` + `index.js`
- [ ] 8.4 `BottomNav/BottomNav.tsx` → `.jsx` + `index.js`
- [ ] 8.5 `BottomSheet/BottomSheet.tsx` → `.jsx` + `index.js`
- [ ] 8.6 `CreateBillModal/CreateBillModal.tsx` → `.jsx` + `index.js`
- [ ] 8.7 `DebugPanel/DebugPanel.tsx` → `.jsx` + `index.js`
- [ ] 8.8 `FormGroup/FormGroup.tsx` → `.jsx` + `index.js`
- [ ] 8.9 `Header/Header.tsx` → `.jsx` + `index.js`
- [ ] 8.10 `MonthPileCard/MonthPileCard.tsx` → `.jsx` + `index.js`
- [ ] 8.11 `SummaryCards/SummaryCards.tsx` → `.jsx` + `index.js`
- [ ] 8.12 `Toast/Toast.tsx` → `.jsx` + `index.js`

## 9. 页面层 TS→JS 转换（src/pages/）

- [ ] 9.1 `LoginPage/LoginPage.tsx` → `.jsx` + `index.js`
- [ ] 9.2 `HomePage/HomePage.tsx` → `.jsx` + `index.js`
- [ ] 9.3 `BillDetailPage/BillDetailPage.tsx` → `.jsx` + `index.js`
- [ ] 9.4 `ScanPage/ScanPage.tsx` → `.jsx` + `index.js`
- [ ] 9.5 `MembersPage/MembersPage.tsx` → `.jsx` + `index.js`
- [ ] 9.6 `SettingsPage/SettingsPage.tsx` → `.jsx` + `index.js`
- [ ] 9.7 `NotFoundPage/NotFoundPage.tsx` → `.jsx` + `index.js`

## 10. 入口文件与验证

- [ ] 10.1 `main.tsx` → `main.jsx`
- [ ] 10.2 `App.tsx` → `App.jsx`
- [ ] 10.3 更新 `index.html` 中的 script src 路径
- [ ] 10.4 验证 `npm run dev` 启动正常
- [ ] 10.5 验证 `npx vite build` 构建通过
