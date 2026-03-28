## 1. BillSheet 数据模型

- [x] 1.1 在 `EditItem` 接口中增加 `spreadDiscount?: boolean` 字段

## 2. 分摊计算逻辑

- [x] 2.1 在 BillSheet 中实现 `applyDiscountSpread(items: EditItem[])` 纯函数：对每个 spreadDiscount=true 的负数项，按比例调整所有正数项的价格，并从结果中移除已分摊的负数项，结果保留两位小数
- [x] 2.2 在 `handleSave` 中调用 `applyDiscountSpread`，用其返回值构建 itemsPayload（替换原来直接 map 的逻辑）

## 3. UI — 负数行开关

- [x] 3.1 在商品行渲染中，当 `parseFloat(item.price) < 0` 时显示"分摊到商品"toggle 按钮
- [x] 3.2 当没有其他正数价格商品时，toggle 禁用（disabled）
- [x] 3.3 点击 toggle 调用 `updateItem(idx, { spreadDiscount: !item.spreadDiscount })`

## 4. UI — 正数行预览标签

- [x] 4.1 计算 `previewPrices`：若存在任何 spreadDiscount=true 的负数项，对每个正数项计算调整后价格
- [x] 4.2 在正数商品行的单价旁显示 "→ ¥<调整后价格>" 预览标签（仅当该项价格会被调整时显示）

## 5. 样式

- [x] 5.1 在 global.css 中添加 toggle 按钮和预览标签的样式

## 6. 构建验证

- [x] 6.1 运行 `npm run build` 确保无 TypeScript 错误
