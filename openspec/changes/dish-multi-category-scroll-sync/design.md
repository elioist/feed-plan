## Context

当前 `dishes` 表有 `category_id` 外键，每道菜只属于一个分类。移动端菜单页左侧分类栏点击筛选右侧菜品。用户希望改为外卖风格：一道菜可属于多个分类，右侧按分类分组滚动，左侧联动高亮。

## Goals / Non-Goals

**Goals:**
- 菜品支持多分类（多对多）。
- 移动端菜单页实现左侧固定分类栏 + 右侧分组滚动 + 滚动联动高亮。
- 管理后台菜品管理支持多分类选择。
- 保持向后兼容，现有单分类菜品平滑迁移。

**Non-Goals:**
- 不改变分类本身的管理（仍是单层分类）。
- 不做复杂的拖拽排序或分类嵌套。

## Decisions

### 1. 多对多关系表 `dish_categories`

新建 `dish_categories` 表（`dish_id`, `category_id`），替代 `dishes.category_id` 外键。保留 `dishes.category_id` 作为主分类兼容字段，新数据通过 `dish_categories` 管理。

### 2. 移动端滚动联动

使用 `ScrollView` + `onScroll` 监听右侧滚动位置，计算当前可见分类并更新左侧高亮。左侧分类点击使用 `scrollTo` 跳转到对应分类锚点。

### 3. 数据迁移

现有 `dishes.category_id` 数据自动迁移到 `dish_categories` 表，保留向后兼容。

## Risks / Trade-offs

- [Risk] 滚动联动在低端设备上可能有性能问题。→ 使用 `onMomentumScrollEnd` 减少计算频率。
- [Risk] 多分类可能导致菜品列表重复显示。→ 右侧按分类分组展示，同一道菜在不同分类下都显示。
