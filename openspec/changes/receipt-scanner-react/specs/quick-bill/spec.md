## quick-bill

一句话自然语言生成账单。

### Requirements

#### 入口
1. AddBillOverlay 新增"💬 一句话生成"按钮，导航到 `/quick-bill`
2. `/quick-bill` 路由受 ProtectedRoute 保护

#### 输入
3. 提供文本输入框，placeholder 如"昨天和小明吃火锅花了 320"
4. 自动附带当前日期（作为 Claude 的上下文，用户可以在描述中覆盖）
5. 自动附带当前用户 + 好友列表（名字），让 Claude 能识别成员

#### AI 解析
6. 点击"生成"后调用 Supabase Edge Function，发送用户输入 + 当前日期 + 成员名单
7. Claude prompt 要求返回标准 JSON 格式：
   - `icon`: emoji 图标
   - `title`: 账单标题
   - `description`: 简短描述
   - `date`: 日期（YYYY-MM-DD）
   - `color`: 主题色
   - `items`: 商品列表 `[{ name, qty, price }]`
   - `assignments`: 成员分配（哪些人参与哪些商品）
8. 如果用户描述中缺少信息（如没说金额），Claude 应返回合理默认值或在 items 中留空让用户补充
9. 显示加载状态，失败时显示错误信息并可重试

#### 结果编辑
10. 展示 Claude 返回的账单预览（复用扫描结果的编辑组件）
11. 可编辑：标题、日期、商品名称/数量/价格、成员分配
12. 实时更新总金额和人均金额

#### 保存
13. 确认后创建 bill + bill_items 记录
14. 保存成功后 toast 提示 + 返回首页
