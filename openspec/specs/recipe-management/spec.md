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

系统 SHALL 提供菜谱的数据模型与管理 API。菜谱 MUST 包含 id、name、category_id、cover_image、description、reference_url、recipe_content、difficulty、is_active；difficulty MUST 限定为 easy、medium、hard。仅 chef 可以创建、更新、启用、停用菜谱。系统 MUST NOT 在新后台主流程中保留 bili_video、ingredients 或 recipe_steps 兼容字段。

#### Scenario: 主厨创建富文本菜谱
- **WHEN** 角色为 chef 的用户提交合法菜谱基础信息、recipe_content 和可选 cover_image
- **THEN** 系统创建菜谱并返回 201，响应体包含菜谱 id、分类、封面路径、参考链接和 recipe_content

#### Scenario: 主厨更新富文本菜谱
- **WHEN** 角色为 chef 的用户更新某个菜谱的 recipe_content、cover_image 或 reference_url
- **THEN** 系统保存更新并返回更新后的菜谱详情

#### Scenario: 创建菜谱引用不存在分类
- **WHEN** 角色为 chef 的用户创建菜谱时提交不存在的 category_id
- **THEN** 系统返回 400 或 404，且不创建菜谱

#### Scenario: 食客更新菜谱被拒
- **WHEN** 角色为 diner 的用户请求更新菜谱
- **THEN** 系统返回 403

#### Scenario: 主厨停用菜谱
- **WHEN** 角色为 chef 的用户停用某个菜谱
- **THEN** 系统将该菜谱 is_active 置为 false，后续食客列表与详情不可见

### Requirement: 菜谱浏览与筛选

系统 SHALL 提供菜谱列表与详情浏览 API。列表 MUST 支持按 category_id、关键词、启用状态筛选，并以稳定顺序返回。关键词搜索 MUST 匹配 name、description 或 recipe_content。diner 只能浏览启用菜谱；chef 可以浏览全部菜谱或按启用状态筛选。

#### Scenario: 按关键词搜索富文本菜谱
- **WHEN** 已登录用户使用关键词请求菜谱列表
- **THEN** 系统返回名称、描述或 recipe_content 匹配关键词且对当前角色可见的菜谱

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

### Requirement: 图片上传

系统 SHALL 提供本地图片上传能力，用于菜谱封面。仅 chef 可以上传图片。上传接口 MUST 校验文件大小、MIME 类型和扩展名；MUST 使用服务端生成的随机文件名保存文件；MUST 返回可存入 cover_image 的访问路径；MUST NOT 信任或直接使用客户端原始文件名作为存储路径。

#### Scenario: 主厨上传合法封面图片
- **WHEN** 角色为 chef 的用户上传合法 jpeg、png 或 webp 图片且大小在限制内
- **THEN** 系统保存图片到服务器本地上传目录，并返回可访问路径

#### Scenario: 非图片文件被拒绝
- **WHEN** 角色为 chef 的用户上传非图片文件或扩展名不合法的文件
- **THEN** 系统返回 400，且不保存文件

#### Scenario: 超过大小限制被拒绝
- **WHEN** 角色为 chef 的用户上传超过大小限制的图片
- **THEN** 系统返回 400，且不保存文件

#### Scenario: 食客上传图片被拒
- **WHEN** 角色为 diner 的用户请求上传图片
- **THEN** 系统返回 403

