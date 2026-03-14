## Why

旧版 `split-app.js` 中有卡片滑动音效系统（Web Audio API），包含 3 个内置音效。新版 SPA 缺少此功能。需要迁移为 React 方案。

## What Changes

- 创建 `SfxContext` + `SfxProvider` 管理音效状态（enabled, volume, current sound）
- 创建 `useSfx` hook，暴露 `playSfx()` 和 `checkSfxTrigger(frac)` 函数
- 内置 3 个音效文件（base64 data URI 嵌入或静态文件）
- 在 BillCardCarousel 滑动回调中集成 `checkSfxTrigger`
- 设置页面增加音效开关和音效切换

## Capabilities

### New Capabilities
- `slide-sfx`: 卡片滑动音效系统 — Context + Hook + 内置音效

### Modified Capabilities
_(无)_

## Impact

- `src/contexts/SfxContext.tsx` — 新建
- `src/hooks/useSfx.ts` — 新建
- `src/lib/sounds.ts` — 新建（内置音效 data URI）
- `src/components/BillCardCarousel/BillCardCarousel.tsx` — 集成滑动触发
- `src/pages/SettingsPage.tsx` — 增加音效设置 UI
- `src/App.tsx` — 包裹 SfxProvider
