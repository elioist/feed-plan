## 1. 数据库模型与迁移

- [x] 1.1 在 `packages/db` 新增 `categories` schema，包含 id、name、sort_order、created_at、updated_at
- [x] 1.2 在 `packages/db` 新增 `dishes` schema，包含 category_id 外键、cover_image、description、bili_video、difficulty、is_active、时间字段
- [x] 1.3 在 `packages/db` 新增 `ingredients` schema，包含 dish_id 外键、name、amount、sort_order
- [x] 1.4 在 `packages/db` 新增 `recipe_steps` schema，包含 dish_id 外键、step_no、content、image，并约束同一菜谱 step_no 唯一
- [x] 1.5 导出新增 schema 与推导类型，生成并验证 Drizzle migration

## 2. 共享类型与校验

- [x] 2.1 在 `packages/shared` 新增菜谱难度枚举与分类 schema/type
- [x] 2.2 在 `packages/shared` 新增菜谱创建、更新、启用状态、列表查询 schema/type
- [x] 2.3 在 `packages/shared` 新增食材、做法步骤、菜谱详情响应 schema/type
- [x] 2.4 确认 shared 包 build 与 typecheck 通过

## 3. 后端模块结构

- [x] 3.1 新增 `RecipeModule` 并接入 `AppModule`
- [x] 3.2 实现 `CategoriesService`：列表、创建、更新、未引用删除、被引用返回 409
- [x] 3.3 实现 `DishesService`：列表筛选、详情、创建、更新、启用/停用、软删除停用
- [x] 3.4 菜谱创建与更新使用事务写入基础信息、食材、做法步骤，保证失败不产生部分写入
- [x] 3.5 实现角色可见性：`diner` 仅能读取启用菜谱，`chef` 可读取全部或按启用状态筛选

## 4. 后端 API

- [x] 4.1 实现分类接口：`GET /categories`、`POST /categories`、`PATCH /categories/:id`、`DELETE /categories/:id`
- [x] 4.2 实现菜谱接口：`GET /dishes`、`GET /dishes/:id`、`POST /dishes`、`PATCH /dishes/:id`
- [x] 4.3 实现菜谱启用状态接口：`PATCH /dishes/:id/active`，并让 `DELETE /dishes/:id` 执行停用语义
- [x] 4.4 所有接口接入 `JwtAuthGuard`；写操作接入 `RolesGuard` 与 `@Roles('chef')`
- [x] 4.5 所有请求体和查询参数使用 shared Zod schema 通过 `ZodValidationPipe` 校验

## 5. 测试

- [x] 5.1 为分类服务编写单元测试，覆盖排序、创建、更新、删除冲突
- [x] 5.2 为菜谱服务编写单元测试，覆盖聚合写入、整体替换食材步骤、软删除、角色可见性
- [x] 5.3 编写分类 API 集成测试，覆盖 200/201/400/401/403/404/409
- [x] 5.4 编写菜谱 API 集成测试，覆盖列表筛选、详情聚合、diner 不可见停用菜谱、chef 可筛选停用菜谱
- [x] 5.5 覆盖无效 difficulty、重复 step_no、不存在 category_id 的 400/404 路径

## 6. 验证与文档

- [x] 6.1 更新 README 或本地开发说明，补充菜谱 migration 与 API 验证示例
- [x] 6.2 运行 `pnpm run format:check`
- [x] 6.3 运行 `pnpm run lint`
- [x] 6.4 运行 `pnpm run typecheck`
- [x] 6.5 运行 `pnpm run test`
- [x] 6.6 运行 `openspec validate recipe-management --strict`
