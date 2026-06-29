## 1. 数据库与共享类型

- [x] 1.1 新增 `dish_categories` 关联表（`dish_id`, `category_id`）
- [x] 1.2 `packages/shared` 更新菜品类型，`category` 改为 `categories` 数组
- [x] 1.3 数据迁移：将现有 `dishes.category_id` 数据写入 `dish_categories` 表（数据库启动后运行 `npx tsx packages/db/src/migrate-dish-categories.ts`）

## 2. 后端 API

- [x] 2.1 菜品创建/更新接口支持多分类写入
- [x] 2.2 菜品列表/详情接口返回多分类信息
- [x] 2.3 按分类分组查询菜品接口（移动端用）— 客户端分组实现

## 3. 管理后台

- [x] 3.1 菜品管理表单支持多分类选择（Select multiple）
- [x] 3.2 菜品列表显示所属分类标签

## 4. 移动端菜单页

- [x] 4.1 重构为左侧固定分类栏 + 右侧分组滚动布局
- [x] 4.2 实现滚动联动：右侧滚动时左侧自动高亮
- [x] 4.3 实现点击左侧分类跳转到对应位置
- [x] 4.4 搜索功能适配新布局
