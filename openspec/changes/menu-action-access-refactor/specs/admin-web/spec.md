## MODIFIED Requirements

### Requirement: 后台布局与导航

系统 SHALL 提供 PC 后台布局，包含侧边导航、顶部当前用户信息、退出入口、标签页和内容区域。导航 MUST 来自当前用户菜单清单接口，而不是静态前端菜单表。菜单 MUST 支持目录、内部页面、iframe 和外链。内部页面 MUST 由前端 route registry 懒加载，后端返回的 component key 若不在 registry 中 MUST 不被注册为可访问页面。

#### Scenario: 登录后加载动态菜单
- **WHEN** 已登录用户进入后台
- **THEN** 系统恢复会话、请求当前用户菜单清单、生成动态路由，并渲染该用户可访问的导航

#### Scenario: 直接访问未授权路径
- **WHEN** 用户直接访问自己菜单清单中不存在的内部路径
- **THEN** 系统展示 403 或跳转到默认可访问首页

#### Scenario: 点击外链菜单
- **WHEN** 用户点击 link 类型菜单
- **THEN** 系统按菜单配置在当前窗口或新窗口打开 externalUrl

#### Scenario: 打开 iframe 菜单
- **WHEN** 用户点击 iframe 类型菜单
- **THEN** 系统在后台布局内容区内嵌 externalUrl

#### Scenario: 缓存页面
- **WHEN** 用户打开 `isCache=true` 的内部页面并切换到其他标签页后返回
- **THEN** 系统尽量保留该页面组件状态，直到对应标签页被关闭或缓存被刷新

### Requirement: 用户与系统管理页面

系统 SHALL 提供用户管理、角色管理、菜单管理、系统设置和主题设置入口。仅具备对应菜单或按钮动作的用户可以访问管理能力。用户管理 MUST 支持查看用户列表、搜索用户、新增用户、维护用户多角色授权、删除符合条件的用户、重置其他用户密码；角色管理 MUST 支持搜索、新增、编辑、删除角色和勾选菜单/按钮；菜单管理 MUST 支持配置菜单类型、路由元数据、外链、iframe、缓存和按钮动作。系统 MUST NOT 提供独立权限点管理入口。

#### Scenario: 查看角色管理
- **WHEN** 具备角色管理动作权限的用户进入角色管理页面
- **THEN** 系统从 API 获取角色、菜单和按钮，展示搜索、新增、编辑、删除和菜单/按钮勾选能力

#### Scenario: 角色菜单按钮授权
- **WHEN** 授权用户为角色勾选菜单和按钮并保存
- **THEN** 系统调用角色菜单授权 API，并刷新角色详情

#### Scenario: 查看菜单管理
- **WHEN** 具备菜单管理动作权限的用户进入菜单管理页面
- **THEN** 系统展示菜单树，并允许维护目录、内部页面、iframe、外链和按钮动作

#### Scenario: 配置内部页面菜单
- **WHEN** 授权用户创建或编辑 page 类型菜单
- **THEN** 系统要求提供 path 和 componentKey，并允许配置 layoutKey、isCache、isTabVisible、isAffix 和 activeMenuKey

#### Scenario: 配置 iframe 菜单
- **WHEN** 授权用户创建或编辑 iframe 类型菜单
- **THEN** 系统要求提供 path 和 externalUrl，并允许配置是否缓存

#### Scenario: 配置外链菜单
- **WHEN** 授权用户创建或编辑 link 类型菜单
- **THEN** 系统要求提供 externalUrl，并允许配置是否新窗口打开

#### Scenario: 权限点管理入口不存在
- **WHEN** 用户查看系统管理导航或直接访问旧权限点路径
- **THEN** 系统不展示权限点管理入口，旧路径不可作为有效管理页面访问
