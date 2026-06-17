## ADDED Requirements

### Requirement: 当前餐次场次

系统 SHALL 提供当前餐次场次能力。meal MUST 包含 id、title、meal_date、meal_type、type、status、created_by、created_at、completed_at；meal_type MUST 限定为 breakfast、lunch、dinner；status MUST 限定为 ordering、completed。已登录用户可以获取或创建当前 `ordering` 场次。

#### Scenario: 创建当前 ordering 场次
- **WHEN** 已登录用户请求获取当前日期与餐型的 ordering 场次且不存在
- **THEN** 系统创建 meal，状态为 ordering，并返回 201 或 200 与 meal 信息

#### Scenario: 返回已存在 ordering 场次
- **WHEN** 已登录用户请求获取当前日期与餐型的 ordering 场次且已存在
- **THEN** 系统返回已有 meal，不创建重复 ordering 场次

#### Scenario: 餐型不合法
- **WHEN** 客户端提交不在 breakfast、lunch、dinner 内的 meal_type
- **THEN** 系统返回 400

### Requirement: 加菜与数量累加

系统 SHALL 允许 `chef` 与 `diner` 向 status 为 ordering 的 meal 加菜。订单 MUST 记录 meal_id、dish_id、user_id、guest_name、quantity、note、created_at。当前登录用户加菜时 MUST 写入 user_id，guest_name MUST 为空。同一 meal、dish、user 重复加菜时 MUST 累加 quantity。

#### Scenario: 登录用户首次加菜
- **WHEN** 已登录用户向 ordering meal 添加启用菜谱并提交 quantity
- **THEN** 系统创建 order，quantity 等于提交数量，user_id 为当前用户 id

#### Scenario: 同一用户重复加同一道菜
- **WHEN** 同一登录用户再次向同一 meal 添加同一 dish
- **THEN** 系统累加既有 order 的 quantity，而不是创建重复 order

#### Scenario: 加菜到 completed meal
- **WHEN** 已登录用户向 completed meal 添加菜品
- **THEN** 系统返回 409，且订单保持不变

#### Scenario: 加停用菜谱
- **WHEN** 已登录用户向 meal 添加 is_active 为 false 的菜谱
- **THEN** 系统返回 404 或 400，且不创建订单

### Requirement: 主厨完成本次点餐

系统 SHALL 仅允许 `chef` 完成本次点餐。完成操作 MUST 将 meal.status 从 ordering 更新为 completed，并写入 completed_at。completed meal MUST 不再允许加菜或修改订单数量。

#### Scenario: 主厨完成 ordering meal
- **WHEN** 角色为 chef 的用户完成 status 为 ordering 的 meal
- **THEN** 系统将 meal.status 置为 completed，写入 completed_at，并返回更新后的菜单详情

#### Scenario: 食客完成 meal 被拒
- **WHEN** 角色为 diner 的用户请求完成 meal
- **THEN** 系统返回 403

#### Scenario: 重复完成 meal
- **WHEN** 角色为 chef 的用户请求完成已 completed 的 meal
- **THEN** 系统返回 409

### Requirement: 菜单查询

系统 SHALL 提供菜单查询能力，支持按日期、餐型、状态查询 meal，并返回 meal 信息、订单明细、按菜品聚合的菜单项、菜谱摘要与点单人信息。今日菜单查询 MUST 默认使用服务器当前日期。

#### Scenario: 查询今日菜单
- **WHEN** 已登录用户请求今日菜单
- **THEN** 系统返回今日相关 meals 及每个 meal 的订单聚合信息

#### Scenario: 按日期和餐型查询菜单
- **WHEN** 已登录用户提交 meal_date 与 meal_type 查询菜单
- **THEN** 系统返回匹配条件的 meals

#### Scenario: 空菜单
- **WHEN** 指定日期与餐型没有 meal
- **THEN** 系统返回空列表，而不是 404

#### Scenario: 菜单聚合数量
- **WHEN** 多个用户在同一 meal 中点同一道菜
- **THEN** 菜单详情按 dish 聚合 total_quantity，并保留按用户拆分的 quantities

### Requirement: 点菜接口认证与校验

系统 SHALL 对所有 meal-ordering 接口要求 JWT 认证。请求体与查询参数 MUST 使用共享 Zod schema 校验；无效输入 MUST 返回 400，缺失或无效令牌 MUST 返回 401，不存在的 meal 或 dish MUST 返回 404。

#### Scenario: 未登录查询菜单
- **WHEN** 客户端未携带有效 JWT 请求菜单查询接口
- **THEN** 系统返回 401

#### Scenario: 加菜数量不合法
- **WHEN** 已登录用户提交 quantity 小于 1 的加菜请求
- **THEN** 系统返回 400

#### Scenario: meal 不存在
- **WHEN** 已登录用户向不存在的 meal 加菜或完成 meal
- **THEN** 系统返回 404
