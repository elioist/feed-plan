## Why

当前菜品只能属于一个分类，移动端菜单页用左侧分类筛选右侧菜品列表。实际外卖点餐体验中，一道菜可以同时出现在多个分类下（如"招牌菜"和"家常菜"），且右侧滚动时左侧分类自动联动高亮，体验更好。本变更将菜品分类改为多对多关系，并实现移动端菜单页的滚动联动交互。

## What Changes

- 新增 `dish_categories` 多对多关系表，支持一道菜属于多个分类。
- 移动端菜单页改为左侧固定分类栏 + 右侧按分类分组滚动的布局。
- 滚动右侧菜品列表时，左侧分类栏自动高亮当前可见分类。
- 点击左侧分类，右侧跳转到对应分类位置。
- 后端菜品接口返回多分类信息。
- 管理后台菜品管理支持选择多个分类。

## Capabilities

### New Capabilities

- `dish-multi-category`: 菜品多分类支持，包括数据模型、API 和管理后台。

### Modified Capabilities

- `mobile-menu-scroll-sync`: 移动端菜单页改为滚动联动布局，替代原有筛选模式。

## Impact

- `packages/db`: 新增 `dish_categories` 关联表。
- `packages/shared`: 更新菜品类型定义，`category` 改为 `categories` 数组。
- `apps/server`: 菜品接口支持多分类查询和写入。
- `apps/admin-web`: 菜品管理表单支持多分类选择。
- `apps/mobile`: 菜单页面重构为滚动联动布局。
