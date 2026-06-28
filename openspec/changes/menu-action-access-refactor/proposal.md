## Why

当前后台授权同时存在两套模型：一套是 `permissions` / `role_permissions` / `permission_action_bindings`，用于后端 `@RequireAccess(...)`；另一套是 `admin_menus` / `admin_menu_buttons` / `role_menus` / `role_menu_buttons`，用于菜单和按钮显隐。两套模型表达的都是“角色可以做什么”，导致角色授权页面、后端接口鉴权和前端按钮权限需要重复维护。

项目尚未上线，可以接受 breaking change。为了让架构更清晰，权限点管理应正式移除，授权模型收敛为“菜单 + 按钮动作”。菜单决定页面/路由入口，按钮动作决定页面内操作和后端接口访问。这个方向与 Vben 的菜单管理模型一致，也更适合后续动态路由、外链、iframe 和页面缓存能力。

## What Changes

- 移除独立权限点管理能力，不再提供权限点 CRUD 页面和 `permissions` resource 作为业务配置入口。
- 将菜单模型升级为路由清单模型，支持目录、内部页面、iframe、外链四类菜单。
- 菜单增加组件标识、外链地址、布局标识、是否缓存、是否显示在菜单/标签页、是否固定标签页、激活菜单等路由元数据。
- 按钮权限保留在菜单下，按钮 `action` 成为后端接口鉴权的主要动作码。
- 后端 `@RequireAccess(...)` 从权限点映射改为校验当前用户通过角色拥有的菜单 key 或按钮 action。
- 角色授权页改为只维护菜单树和按钮动作，不再维护权限点。
- Admin 路由从静态文件路由树迁移为后端菜单驱动的动态路由树，前端通过白名单 registry 将后端 `componentKey` 映射为懒加载页面组件。
- 外链菜单按配置当前窗口或新窗口打开；iframe 菜单使用统一 iframe 页面承载。
- 为后续页面缓存建立 `isCache` 元数据和前端缓存容器。

## Capabilities

### New Capabilities

- `menu-action-access-refactor`: 菜单/按钮动作一体化授权、动态路由、外链/iframe 菜单和路由缓存元数据。

### Modified Capabilities

- `user-auth`: 后端授权从权限点驱动改为菜单/按钮动作驱动；角色授权不再依赖独立权限点。
- `admin-web`: 菜单管理升级为路由清单管理；角色管理改为菜单/按钮授权；权限点管理入口移除；后台路由由后端菜单驱动生成。

## Impact

- `packages/db`: 移除或废弃权限点相关表；扩展 `admin_menus` 字段；保留并强化 `admin_menu_buttons`、`role_menus`、`role_menu_buttons`。
- `packages/shared`: 移除权限点 CRUD DTO；扩展菜单类型、路由元数据、角色菜单授权 DTO。
- `packages/api-client`: 移除 permissions resource；扩展 menus resource 和当前用户菜单/路由清单接口。
- `apps/server`: 改造 AccessGuard、auth/me 权限摘要、菜单接口、角色授权接口、seed 和测试。
- `apps/admin-web`: 改造 router bootstrap、菜单/角色管理页面、按钮权限 hook、布局菜单数据源和测试。
- 迁移策略：项目未上线，不提供旧权限点兼容层；用迁移和 seed 直接迁到目标模型。
