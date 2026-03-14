## 1. 音效基础设施

- [ ] 1.1 创建 `src/lib/sounds.ts`（3 个内置音效的 base64 data URI，从旧版代码提取）
- [ ] 1.2 创建 `src/contexts/SfxContext.tsx`（SfxProvider + AudioContext 管理 + 音效加载/播放）
- [ ] 1.3 创建 `src/hooks/useSfx.ts`（导出 useSfx hook）

## 2. 集成

- [ ] 2.1 在 `App.tsx` 中包裹 `<SfxProvider>`
- [ ] 2.2 在 `BillCardCarousel.tsx` 滑动回调中调用 `checkSfxTrigger()`
- [ ] 2.3 在 `SettingsPage.tsx` 增加音效开关和音效切换 UI

## 3. 验证

- [ ] 3.1 `npx vite build` 构建通过
