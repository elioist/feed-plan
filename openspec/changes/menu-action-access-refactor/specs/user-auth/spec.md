## MODIFIED Requirements

### Requirement: 用户管理

系统 SHALL 提供仅具备用户管理动作权限的用户可访问的用户管理能力。授权用户 MUST 能够创建用户、查看用户列表、搜索用户、为用户分配多个角色、删除未被业务数据限制的用户。系统 MUST 禁止用户移除自己的最后一个有效管理入口，避免锁死管理入口。用户管理动作权限 MUST 来自角色拥有的菜单按钮 action，而不是独立权限点。

#### Scenario: 创建用户并分配多角色
- **WHEN** 具备用户管理动作权限的用户提交合法用户名、初始密码和角色 ID 列表
- **THEN** 系统创建用户，密码以 bcrypt 哈希存储，绑定提交的多个角色，响应体不包含密码哈希

#### Scenario: 无动作权限访问用户管理
- **WHEN** 不具备用户管理按钮 action 的用户请求用户管理接口
- **THEN** 系统返回 403

### Requirement: 动态角色管理

系统 SHALL 将角色作为数据库配置管理。角色 MUST 支持搜索、新增、编辑、删除和菜单/按钮授权。系统 MUST NOT 将可用角色固定为 `chef` / `diner`，也 MUST NOT 通过独立权限点管理角色能力。

#### Scenario: 为角色授权菜单和按钮
- **WHEN** 授权用户为角色提交菜单 ID 列表和菜单按钮 ID 列表
- **THEN** 系统保存角色菜单和按钮关系，并影响后续用户可访问菜单、按钮和后端动作

#### Scenario: 删除角色保留管理入口
- **WHEN** 授权用户删除角色会导致系统没有任何用户具备菜单或角色管理动作
- **THEN** 系统返回 409

### Requirement: 菜单按钮动作授权

系统 SHALL 使用菜单按钮 action 作为后端敏感操作的授权码。受保护接口 MUST 声明所需 action，系统 MUST 根据当前用户通过角色拥有的菜单按钮判断是否放行。系统 MUST NOT 通过 `permissions`、`role_permissions` 或 `permission_action_bindings` 判断接口访问权限。

#### Scenario: 拥有按钮动作访问接口
- **WHEN** 当前用户的角色拥有某菜单按钮，且该按钮 action 匹配接口声明的 action
- **THEN** 系统放行请求

#### Scenario: 缺少按钮动作访问接口
- **WHEN** 当前用户没有接口所需 action
- **THEN** 系统返回 403

#### Scenario: 权限摘要不包含独立权限点
- **WHEN** 用户登录或请求 `GET /auth/me`
- **THEN** 响应包含 roles、menuKeys、buttonKeys 和 actions，且不包含独立 permissions 列表

### Requirement: 当前用户菜单清单

系统 SHALL 提供当前用户可访问的 Admin 菜单清单接口。该接口 MUST 只返回当前用户角色拥有且可见的菜单，并包含前端构建动态路由所需的菜单类型、路径、组件标识、外链地址、布局和缓存元数据。

#### Scenario: 获取当前用户菜单
- **WHEN** 已登录用户请求当前用户菜单清单
- **THEN** 系统返回该用户可访问的菜单树和菜单按钮，不返回未授权菜单

#### Scenario: 未登录获取菜单
- **WHEN** 未登录用户请求当前用户菜单清单
- **THEN** 系统返回 401

## REMOVED Requirements

### Requirement: 动态权限点管理

系统不再提供独立权限点 CRUD。角色能力由菜单和菜单按钮动作授权表达。
