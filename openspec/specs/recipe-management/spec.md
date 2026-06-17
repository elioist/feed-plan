# recipe-management Specification

## Purpose
定义点菜服务的菜谱后端能力，包括分类、菜谱、食材、做法步骤的数据模型、管理 API、登录浏览 API、角色可见性、输入校验与错误语义。

## Requirements
### Requirement: 分类管理

系统 SHALL 提供菜谱分类的数据模型与 API。分类 MUST 至少包含 id、name、sort_order；分类列表 MUST 按 sort_order 升序、创建时间升序稳定返回。仅 `chef` 可以创建、更新、删除分类；删除已被菜谱引用的分类 MUST 返回 409。

#### Scenario: 主厨创建分类
- **WHEN** 角色为 `chef` 的用户提交合法分类名称与排序值
- **THEN** 系统创建分类并返回 201，响应体包含 id、name、sort_order

#### Scenario: 食客创建分类被拒
- **WHEN** 角色为 `diner` 的用户请求创建分类
- **THEN** 系统返回 403

#### Scenario: 删除被引用分类失败
- **WHEN** 角色为 `chef` 的用户删除仍被至少一个菜谱引用的分类
- **THEN** 系统返回 409，且分类保持不变

#### Scenario: 分类列表稳定排序
- **WHEN** 已登录用户请求分类列表
- **THEN** 系统按 sort_order 升序、创建时间升序返回分类

### Requirement: 菜谱管理

系统 SHALL 提供菜谱的数据模型与管理 API。菜谱 MUST 包含 id、name、category_id、cover_image、description、bili_video、difficulty、is_active；`difficulty` MUST 限定为 `easy`、`medium`、`hard`。仅 `chef` 可以创建、更新、启用、停用菜谱。

#### Scenario: 主厨创建菜谱
- **WHEN** 角色为 `chef` 的用户提交合法菜谱基础信息、食材列表与做法步骤
- **THEN** 系统创建菜谱并返回 201，响应体包含菜谱 id、分类、食材列表与按 step_no 排序的做法步骤

#### Scenario: 创建菜谱引用不存在分类
- **WHEN** 角色为 `chef` 的用户创建菜谱时提交不存在的 category_id
- **THEN** 系统返回 400 或 404，且不创建菜谱

#### Scenario: 食客更新菜谱被拒
- **WHEN** 角色为 `diner` 的用户请求更新菜谱
- **THEN** 系统返回 403

#### Scenario: 主厨停用菜谱
- **WHEN** 角色为 `chef` 的用户停用某个菜谱
- **THEN** 系统将该菜谱 is_active 置为 false，后续食客列表与详情不可见

### Requirement: 食材与做法步骤

系统 SHALL 将食材与做法步骤作为菜谱详情的一部分管理。食材 MUST 包含 name、amount；做法步骤 MUST 包含 step_no、content、image。做法步骤的 step_no MUST 在同一菜谱内唯一并按升序返回。

#### Scenario: 菜谱详情返回食材和步骤
- **WHEN** 已登录用户请求可见菜谱详情
- **THEN** 系统返回菜谱基础信息、食材列表，以及按 step_no 升序排列的做法步骤

#### Scenario: 更新菜谱替换食材和步骤
- **WHEN** 角色为 `chef` 的用户提交新的食材列表与做法步骤列表更新菜谱
- **THEN** 系统在事务内替换该菜谱原有食材和步骤，并返回更新后的详情

#### Scenario: 步骤编号重复
- **WHEN** 角色为 `chef` 的用户提交同一菜谱内重复 step_no 的做法步骤
- **THEN** 系统返回 400，且不写入任何部分更新

### Requirement: 菜谱浏览与筛选

系统 SHALL 提供菜谱列表与详情浏览 API。列表 MUST 支持按 category_id、关键词、启用状态筛选，并以稳定顺序返回。`diner` 只能浏览启用菜谱；`chef` 可以浏览全部菜谱或按启用状态筛选。

#### Scenario: 食客浏览启用菜谱列表
- **WHEN** 角色为 `diner` 的用户请求菜谱列表
- **THEN** 系统仅返回 is_active 为 true 的菜谱

#### Scenario: 主厨浏览停用菜谱列表
- **WHEN** 角色为 `chef` 的用户按 is_active=false 筛选菜谱列表
- **THEN** 系统返回停用菜谱列表

#### Scenario: 按分类筛选菜谱
- **WHEN** 已登录用户使用 category_id 请求菜谱列表
- **THEN** 系统返回该分类下且对当前角色可见的菜谱

#### Scenario: 按关键词搜索菜谱
- **WHEN** 已登录用户使用关键词请求菜谱列表
- **THEN** 系统返回名称或描述匹配关键词且对当前角色可见的菜谱

#### Scenario: 食客访问停用菜谱详情
- **WHEN** 角色为 `diner` 的用户请求 is_active 为 false 的菜谱详情
- **THEN** 系统返回 404

### Requirement: 菜谱接口认证与校验

系统 SHALL 对所有菜谱管理与浏览接口要求 JWT 认证。请求体与查询参数 MUST 使用共享 Zod schema 校验；无效输入 MUST 返回 400，缺失或无效令牌 MUST 返回 401。

#### Scenario: 未登录访问菜谱列表
- **WHEN** 客户端未携带有效 JWT 请求菜谱列表
- **THEN** 系统返回 401

#### Scenario: 创建菜谱请求体不合法
- **WHEN** 角色为 `chef` 的用户提交缺少 name 或 difficulty 不在允许枚举内的菜谱请求
- **THEN** 系统返回 400，并说明校验失败字段

#### Scenario: 访问不存在菜谱
- **WHEN** 已登录用户请求不存在的菜谱详情
- **THEN** 系统返回 404
