# 设计: 卡片滑动音效

## 架构

```
SfxProvider (Context)
  └─ useSfx() hook → playSfx(), checkSfxTrigger(frac)
  └─ AudioContext 懒加载
  └─ 内置音效 AudioBuffer 缓存
```

## SfxContext 状态

```typescript
interface SfxState {
  enabled: boolean
  volume: number        // 0-1, 默认 0.6
  currentIndex: number  // 当前选中音效索引
  soundNames: string[]  // 音效名称列表
}
```

## 核心逻辑

### AudioContext 管理
- 懒加载：首次调用 `playSfx()` 时创建
- 用户交互后 resume suspended 状态

### playSfx()
- 使用 `createBufferSource` + `createGain` 播放当前选中音效
- 音量由 `SfxState.volume` 控制

### checkSfxTrigger(frac)
- 检测滑动位置是否跨过整数边界
- 跨越时调用 `playSfx()`
- 用 `lastInt` ref 追踪上一个整数位置

## 内置音效
- 3 个短 WAV 音效，以 base64 data URI 方式存储在 `src/lib/sounds.ts`
- 启动时自动加载解码为 AudioBuffer

## 集成

### BillCardCarousel
- 在拖拽/滑动的 onDrag 回调中调用 `checkSfxTrigger(progress)`
- `progress` = 当前卡片索引的小数表示

### SettingsPage
- 音效开关 toggle
- 音效选择（3 个内置音效）
- 音量调节滑块（可选，MVP 不需要）
