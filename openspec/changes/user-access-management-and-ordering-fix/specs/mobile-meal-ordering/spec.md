## ADDED Requirements

### Requirement: 点单配置与错误反馈

移动端 SHALL 明确支持配置后端 API base URL。点单请求失败时，移动端 MUST 区分网络连接失败、未登录或登录失效、业务冲突、输入错误和资源不存在，并向用户展示可操作反馈。开发环境下错误反馈 MUST 帮助定位当前 API base 配置。

#### Scenario: API base 未指向后端
- **WHEN** 用户在移动端点单且请求因网络连接失败无法到达后端
- **THEN** 系统提示检查后端地址配置，并在开发环境展示当前 API base

#### Scenario: 登录失效
- **WHEN** 点单接口返回 401
- **THEN** 系统清理本地会话并引导用户重新登录

#### Scenario: 已完成场次点单
- **WHEN** 点单接口返回 409
- **THEN** 系统提示本次点餐已完成，并刷新菜单状态

#### Scenario: 菜品不可点
- **WHEN** 点单接口返回 404 或 400
- **THEN** 系统展示 API 返回的可读错误信息，并保持购物车内容不丢失

## MODIFIED Requirements

### Requirement: 主厨创建场次

主厨 SHALL 能够获取或创建当前用餐场次（meal），指定餐次类型（早餐/午餐/晚餐）。移动端 MUST 调用统一 API client 中的 `POST /meals/current`，不得调用不存在的本地 API 或旧端点。

#### Scenario: 创建新场次
- **WHEN** 主厨在今日菜单页点击"开一单"，选择餐次类型并确认
- **THEN** 系统调用 `POST /meals/current` 获取或创建 `ordering` 场次，刷新菜单列表

#### Scenario: 非主厨无法创建场次
- **WHEN** 食客单击"开一单"按钮
- **THEN** 按钮不显示（仅主厨可见）

### Requirement: 加菜

任何已登录用户 SHALL 能够向 `status=ordering` 的场次添加菜品订单。移动端 MUST 调用统一 API client 中的 `POST /meals/:id/orders`，成功后刷新对应 meal、菜单列表和购物车状态；失败时 MUST 展示可读错误且保留用户未成功提交的选择。

#### Scenario: 添加菜品
- **WHEN** 用户在菜单详情页选择菜品并设置份数，点击"下单"
- **THEN** 系统调用 `POST /meals/:id/orders` 添加订单，刷新订单列表

#### Scenario: 购物车提交点单
- **WHEN** 用户在购物车选择餐型并提交多个菜品
- **THEN** 系统调用 `POST /meals/current` 获取或创建当前场次，再逐项调用 `POST /meals/:id/orders`，全部成功后清空购物车并刷新菜单列表

#### Scenario: 重复下单累加份数
- **WHEN** 用户对同一道菜再次下单
- **THEN** 系统累加该菜品的 `quantity`，而非创建新订单

#### Scenario: 点单失败保留购物车
- **WHEN** 购物车提交过程中任一菜品点单失败
- **THEN** 系统展示失败原因，刷新相关菜单状态，并保留购物车中未确认清空的内容
