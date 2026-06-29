## ADDED Requirements

### Requirement: 菜品多分类

系统 SHALL 支持一道菜属于多个分类。菜品与分类为多对多关系，通过 `dish_categories` 关联表管理。查询菜品时 MUST 返回该菜品所属的所有分类。

#### Scenario: 菜品属于多个分类
- **WHEN** 主厨将一道菜添加到"家常菜"和"快手菜"两个分类
- **THEN** 该菜品在两个分类下都可被找到

#### Scenario: 查询菜品返回多分类
- **WHEN** 客户端请求菜品列表
- **THEN** 每道菜返回 `categories` 数组，包含所有所属分类

#### Scenario: 创建菜品指定多分类
- **WHEN** 主厨创建菜品时选择多个分类
- **THEN** 系统在 `dish_categories` 表中创建关联记录

#### Scenario: 更新菜品分类
- **WHEN** 主厨修改菜品的分类
- **THEN** 系统更新 `dish_categories` 表，保留主分类兼容

## MODIFIED Requirements

### Requirement: 分类筛选

移动端菜单页左侧分类栏 MUST 显示所有分类，点击分类后右侧跳转到该分类位置，而非筛选隐藏其他分类。

#### Scenario: 点击分类跳转
- **WHEN** 用户点击左侧某个分类
- **THEN** 右侧滚动到该分类的第一个菜品位置

#### Scenario: 滚动联动高亮
- **WHEN** 用户滚动右侧菜品列表
- **THEN** 左侧分类栏自动高亮当前可见的分类
