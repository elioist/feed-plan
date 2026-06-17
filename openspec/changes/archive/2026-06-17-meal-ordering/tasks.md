## 1. 数据库模型与迁移

- [x] 1.1 在 `packages/db` 新增 meal/order 枚举常量或共享类型引用
- [x] 1.2 新增 `meals` schema，包含 title、meal_date、meal_type、type、status、created_by、created_at、completed_at
- [x] 1.3 新增 `orders` schema，包含 meal_id、dish_id、user_id、guest_name、quantity、note、created_at
- [x] 1.4 添加外键与唯一/索引约束，支持同一登录用户重复加菜累加
- [x] 1.5 导出新增 schema 与推导类型，生成并验证 Drizzle migration

## 2. 共享类型与校验

- [x] 2.1 在 `packages/shared` 新增 meal_type、meal status、meal type 枚举与 schema/type
- [x] 2.2 新增获取/创建当前 meal 的请求 schema/type
- [x] 2.3 新增加菜请求、完成 meal、菜单查询 schema/type
- [x] 2.4 新增 meal、order、菜单聚合响应 schema/type
- [x] 2.5 确认 shared 包 build 与 typecheck 通过

## 3. 后端模块结构

- [x] 3.1 新增 `MealsModule` 并接入 `AppModule`
- [x] 3.2 实现 `MealsService`：获取或创建当前 ordering meal、查询 meal、完成 meal
- [x] 3.3 实现 `OrdersService` 或 meal 内部订单逻辑：加菜、重复加菜累加、completed 锁定
- [x] 3.4 菜单详情查询聚合 orders，返回按菜品聚合的 items 与订单明细
- [x] 3.5 实现业务约束：只能点启用菜谱、completed 不可加菜、meal/dish 不存在返回 404

## 4. 后端 API

- [x] 4.1 实现 `POST /meals/current` 获取或创建当前 ordering meal
- [x] 4.2 实现 `GET /meals/today` 与 `GET /meals` 菜单查询接口
- [x] 4.3 实现 `GET /meals/:id` 菜单详情接口
- [x] 4.4 实现 `POST /meals/:id/orders` 加菜接口
- [x] 4.5 实现 `PATCH /meals/:id/complete` 主厨结单接口
- [x] 4.6 所有接口接入 `JwtAuthGuard`，结单接口接入 `RolesGuard` 与 `@Roles('chef')`
- [x] 4.7 所有请求体、路径参数、查询参数使用 shared Zod schema 通过 `ZodValidationPipe` 校验

## 5. 测试

- [x] 5.1 为 meal service 编写单元测试，覆盖创建当前场次、返回已有场次、完成 meal、重复完成 409
- [x] 5.2 为加菜逻辑编写单元测试，覆盖首次加菜、重复累加、completed 锁定、停用菜谱拒绝
- [x] 5.3 编写 meal API 集成测试，覆盖未登录 401、diner 可加菜、chef 可结单、diner 结单 403
- [x] 5.4 编写菜单查询测试，覆盖今日菜单、按日期/餐型筛选、空菜单、按菜品聚合数量
- [x] 5.5 覆盖无效 meal_type、quantity 小于 1、meal/dish 不存在的 400/404 路径

## 6. 验证与文档

- [x] 6.1 更新 README 或本地开发说明，补充点菜 API 验证示例
- [x] 6.2 运行 `pnpm run format:check`
- [x] 6.3 运行 `pnpm run lint`
- [x] 6.4 运行 `pnpm run typecheck`
- [x] 6.5 运行 `pnpm run test`
- [x] 6.6 运行 `pnpm run build`
- [x] 6.7 运行 `openspec validate meal-ordering --strict`
