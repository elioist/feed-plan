## Context

项目已经具备用户认证、角色守卫、菜谱管理与启用菜谱浏览能力。`meal-ordering` 是点菜服务的核心业务闭环：主厨开一单，主厨或食客持续加菜，主厨完成本次点餐后锁定。当前仅支持登录用户，未来分享链接会引入免登录 guest。

现有后端接口没有 `/api` 前缀，本 change 继续沿用资源路径，使用 `meals/*` 与 `orders` 子资源。

## Goals / Non-Goals

**Goals:**
- 新增 `meals`、`orders` 数据表，与冻结数据模型一致。
- 支持按日期与餐型获取或创建当前 `ordering` 场次。
- 支持登录用户向 `ordering` 场次加菜，同一用户对同一道菜重复加菜时累加数量。
- 支持查询今日或指定日期/餐型菜单，返回 meal、orders、dish 摘要和点单人信息。
- 仅 `chef` 可以完成本次点餐，完成后 meal 锁定。
- 所有输入通过 shared Zod schema 校验，所有接口要求 JWT。

**Non-Goals:**
- 不实现免登录访客点菜页和 share_links。
- 不实现购物车草稿；点菜请求直接写入当前 meal。
- 不实现撤销点菜、减少数量、删除订单。
- 不实现按订单维度的完成/出餐状态。
- 不实现前端 UI。

## Decisions

### 决策 1：按日期 + 餐型 + 状态管理当前场次
- **选择**：`POST /meals/current` 接受 `mealDate`、`mealType`、可选 `title` 和 `type`，查找同日期同餐型的 `ordering` meal；存在则返回，不存在则创建。
- **理由**：用户体验上“当前晚餐”应是唯一入口，避免重复开多个同餐型未结单场次。
- **取舍**：同一天同餐型完成后，如果需要再次开单，可以创建新的 `ordering` meal；历史 completed 保留。

### 决策 2：重复加菜按点单人累加
- **选择**：唯一累加键为 `meal_id + dish_id + user_id`；未来 guest 使用 `meal_id + dish_id + guest_name`。当前登录用户加菜时写 `user_id`，`guest_name` 保持 null。
- **理由**：既能看总菜品数量，也能知道每个人点了什么。若只按 meal + dish 累加，会丢失点单人信息。
- **取舍**：菜单详情需要在服务层聚合总数量，但数据表达更完整。

### 决策 3：只允许点启用菜谱
- **选择**：加菜前检查 dish 存在且 `is_active=true`。
- **理由**：停用菜谱通常表示暂不提供，不应进入新的点菜单。
- **取舍**：历史订单仍通过外键保留，菜谱后续停用不影响已经点过的 completed meal。

### 决策 4：completed meal 锁定
- **选择**：`PATCH /meals/:id/complete` 仅允许 chef 将 `ordering` 置为 `completed`，写入 `completed_at`。completed 后加菜返回 409。
- **理由**：符合主厨结单权，避免做菜过程中菜单继续变化。

### 决策 5：菜单查询返回两层视图
- **选择**：详情返回 orders 明细，同时提供按 dish 聚合的 `items`，每个 item 包含 dish 摘要、总数量、按点单人拆分的 quantities。
- **理由**：主厨做菜需要按菜汇总，食客查看也需要知道是谁点了哪些。后续 UI 可直接选择合适视图。

## Risks / Trade-offs

- **[并发重复加菜可能竞争]** → 使用数据库唯一约束配合事务/冲突处理；首版低并发但仍保留一致性约束。
- **[完成后再次开同餐型单的语义]** → `current` 只返回 ordering；若旧 meal completed，则可新建同日期同餐型 ordering，历史仍可查询。
- **[guest_name 预留但未开放]** → 当前 schema 保留字段，API 不接受 guest 点菜；未来 share-links change 再补校验和权限。
- **[订单删除/减量缺失]** → 首版聚焦“结单前无限加菜”，不提供减少或撤销。后续如果实际使用需要，再开独立 change。

## Migration Plan

- 新增 Drizzle schema：`meals`、`orders`，外键引用 `users`、`dishes`。
- 生成 migration；不会修改现有 `users`、`dishes` 数据。
- 回滚时可删除新增表；当前没有生产数据，回滚风险低。

## Open Questions

- 是否需要“取消本次点餐”状态，先不做；如需要可后续新增 `cancelled` 状态。
- 是否需要支持减少数量或删除某人的点菜记录，先不做；等真实使用反馈。
