## ADDED Requirements

### Requirement: 今日菜单页

系统 SHALL 提供今日菜单页，默认展示当天的菜单列表，包含所有 `status=ordering` 的活跃场次。

#### Scenario: 查看今日菜单
- **WHEN** 用户进入今日菜单页
- **THEN** 系统调用 `GET /meals` 获取今日的活跃菜单，展示餐次类型（早餐/午餐/晚餐）和当前订单概览

#### Scenario: 查看历史菜单
- **WHEN** 用户切换到"历史"标签
- **THEN** 系统显示已完成（`status=completed`）的菜单列表

### Requirement: 菜单详情页

系统 SHALL 提供菜单详情页，展示某个场次的完整信息，包括餐次类型、状态、订单明细和菜品聚合。

#### Scenario: 查看菜单详情
- **WHEN** 用户点击某个菜单卡片
- **THEN** 系统调用 `GET /meals/:id` 获取详情，展示场次信息、订单列表（菜品名、份数、点单人）

#### Scenario: 查看菜品聚合
- **WHEN** 菜单详情页加载完成
- **THEN** 系统展示菜品聚合视图，显示每道菜的总份数（totalQuantity）

### Requirement: 主厨创建场次

主厨 SHALL 能够创建新的用餐场次（meal），指定餐次类型（早餐/午餐/晚餐）。

#### Scenario: 创建新场次
- **WHEN** 主厨在今日菜单页点击"开一单"，选择餐次类型并确认
- **THEN** 系统调用 `POST /meals` 创建新场次，status 为 `ordering`，刷新菜单列表

#### Scenario: 飞主厨无法创建场次
- **WHEN** 食客单击"开一单"按钮
- **THEN** 按钮不显示（仅主厨可见）

### Requirement: 加菜

任何已登录用户 SHALL 能够向 `status=ordering` 的场次添加菜品订单。

#### Scenario: 添加菜品
- **WHEN** 用户在菜单详情页选择菜品并设置份数，点击"下单"
- **THEN** 系统调用 `POST /orders` 创建订单，刷新订单列表

#### Scenario: 重复下单累加份数
- **WHEN** 用户对同一道菜再次下单
- **THEN** 系统累加该菜品的 `quantity`，而非创建新订单

### Requirement: 主厨完成点餐

主厨 SHALL 能够将 `status=ordering` 的场次标记为 `completed`，完成后锁定不可再加菜。

#### Scenario: 完成点餐
- **WHEN** 主厨在菜单详情页点击"完成点餐"并确认
- **THEN** 系统调用 `PATCH /meals/:id/complete`，场次状态变为 `completed`

#### Scenario: 已完成场次不可再操作
- **WHEN** 场次状态为 `completed`
- **THEN** 系统不显示"下单"和"完成点餐"按钮
