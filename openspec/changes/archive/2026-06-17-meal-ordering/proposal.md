## Why

认证与菜谱管理已经就绪，下一步需要把点菜服务的核心闭环跑通：开一单、任何登录用户加菜、主厨结单锁定。没有这个能力，菜谱只能被浏览和维护，无法承载“今天吃什么”的实际决策流程。

## What Changes

- 新增餐次场次 `meals` 与点菜记录 `orders` 的数据模型和后端 API。
- 支持按日期与餐型创建/获取当前 `ordering` 场次，餐型包含 breakfast / lunch / dinner。
- `chef` 与 `diner` 都可以向当前 `ordering` 场次加菜；同一用户对同一菜谱重复加菜时累加 quantity。
- 仅 `chef` 可以完成本次点餐，将 meal 状态从 `ordering` 置为 `completed` 并锁定后续加菜。
- 提供今日/指定日期菜单查询，返回 meal 信息、订单聚合、菜谱摘要与点单人信息。
- 本次不实现免登录 guest/share link；但 `orders.guest_name` 字段按冻结数据模型预留。

## Capabilities

### New Capabilities

- `meal-ordering`: 餐次场次、加菜、数量累加、主厨结单、今日菜单查询的后端数据模型与 API。

### Modified Capabilities

<!-- 无需修改既有 user-auth 或 recipe-management 需求；本变更复用登录用户、角色与启用菜谱。 -->

## Impact

- **数据库**：新增 `meals`、`orders` 表及 migration，外键引用 `users` 与 `dishes`。
- **共享包**：新增餐型、餐次状态、点菜请求/响应、菜单详情等 Zod schema 与类型。
- **后端 API**：新增 NestJS 点菜模块，包含开单/获取当前场次、加菜、完成点餐、菜单查询接口。
- **权限**：所有接口要求 JWT；加菜允许 `chef` 与 `diner`；完成点餐仅允许 `chef`。
- **业务约束**：仅允许对 `ordering` 场次加菜；仅允许点启用菜谱；completed 场次不可修改。
- **测试**：新增 service 单测与 API 集成测试，覆盖 200/201/400/401/403/404/409 路径。
