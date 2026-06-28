## Context

当前 RBAC 是在用户管理变更中新增的数据库驱动权限模型。它解决了固定 `chef` / `diner` 的问题，但又叠加了一层独立权限点系统。与此同时，项目已经有菜单、按钮、角色菜单授权、角色按钮授权表，且登录态已经返回 `menuKeys` 和 `buttonKeys`。

用户希望参考 Vben 的菜单管理：菜单本身包含类型、路由、组件、外链、iframe 和元数据；按钮作为菜单下的操作权限；角色直接勾选菜单与按钮。项目未上线，可以删除旧实现并同步迁移数据、调用方和测试。

## Goals / Non-Goals

**Goals:**

- 以菜单和按钮动作作为唯一授权配置来源，移除独立权限点管理。
- 后端接口鉴权直接基于当前用户拥有的菜单 key 或按钮 action。
- 支持目录、内部页面、iframe、外链四类菜单。
- 支持后端菜单驱动 Admin 动态路由，但前端仍通过白名单 registry 加载真实组件。
- 支持路由缓存元数据，第一版落 `isCache` 字段和前端缓存容器。
- 支持外链在当前窗口或新窗口打开。
- 保留 super_admin、chef、diner 等默认角色，但角色能力完全来自数据库授权。

**Non-Goals:**

- 不实现组织、多租户、数据行级权限。
- 不允许后端返回任意模块路径并让前端无白名单加载。
- 不实现权限点兼容层、旧接口兼容或历史数据双写。
- 不实现完整审计日志。
- 不把移动端路由纳入本次动态路由改造。

## Decisions

### 1. 授权模型收敛为菜单和按钮动作

删除独立权限点管理入口和角色-权限点授权流程。角色只拥有菜单和按钮：

- `role_menus` 控制可访问的页面/目录/iframe/link 入口。
- `role_menu_buttons` 控制页面内按钮和后端动作。
- `admin_menu_buttons.action` 是稳定动作码，例如 `recipes.dishes.create`、`recipes.dishes.delete`、`meals.complete`。

后端 `@RequireAccess(...)` 继续保留动作码声明，但 Guard 改为检查当前用户的按钮 actions。页面级接口也可以使用菜单 key 声明访问，例如 `@RequireMenu('recipes.dishes')`，用于只要求进入某页面的接口。

### 2. 菜单表升级为路由清单

`admin_menus.type` 扩展为：

- `directory`: 目录，只用于分组，不直接渲染页面。
- `page`: 内部页面，必须提供 `path` 和 `component_key`。
- `iframe`: 内嵌外链页面，必须提供 `path` 和 `external_url`，使用统一 iframe 组件。
- `link`: 外链菜单，必须提供 `external_url`，可配置当前窗口或新窗口打开。

菜单新增字段：

- `component_key`: 前端页面 registry key。
- `external_url`: iframe/link 的目标地址。
- `open_in_new_tab`: 外链是否新窗口打开。
- `layout_key`: 布局标识，第一版支持 `admin` 和 `blank`，默认 `admin`。
- `is_cache`: 是否缓存页面。
- `is_tab_visible`: 是否显示在标签页。
- `is_affix`: 是否固定标签页。
- `active_menu_key`: 隐藏页或详情页激活的菜单 key。

保留 `key`、`title`、`path`、`icon`、`sort_order`、`is_visible`、`is_system`、`parent_id`。

### 3. 后端提供当前用户路由清单

新增当前用户可访问菜单接口，例如 `GET /auth/menus`。该接口只返回当前用户角色授权后的菜单和按钮数据，并按父子关系、排序和显隐规则返回。`GET /menus` 仍作为菜单管理接口，只有具备菜单管理动作的用户可访问完整数据。

`GET /auth/me` 可以继续返回 `menuKeys` 和 `buttonKeys`，但不再返回 `permissions`。如果前端需要渲染导航，应使用 `GET /auth/menus` 的完整元数据，而不是用静态菜单过滤。

### 4. Admin 使用动态路由 builder

Admin 不再以 TanStack Router 文件路由生成的 `routeTree.gen.ts` 作为业务路由来源。应用启动或登录后先恢复用户，再请求当前用户路由清单，用 code-based TanStack Router 组装路由树。

前端维护 `routeRegistry`：

```ts
const routeRegistry = {
  dashboard: () => import('~/pages/dashboard/DashboardPage'),
  'recipes.categories': () => import('~/pages/categories/CategoryListPage'),
  'recipes.dishes': () => import('~/pages/dishes/DishListPage'),
  'recipes.tags': () => import('~/pages/tags/TagListPage'),
  meals: () => import('~/pages/meals/MealListPage'),
  'system.users': () => import('~/pages/users/UserListPage'),
  'system.roles': () => import('~/pages/roles/RoleListPage'),
  'system.menus': () => import('~/pages/menus/MenuListPage'),
  'system.settings': () => import('~/pages/settings/SettingsPage'),
};
```

后端只返回 `componentKey`，前端只加载 registry 中存在的组件。缺失 registry 的菜单不注册为内部页面路由，并在开发环境输出诊断信息。

### 5. 外链、iframe 和缓存

`link` 类型菜单点击时按 `openInNewTab` 决定 `window.open` 或 `window.location.href`。`iframe` 类型注册为内部路由，渲染统一 `IframePage`，由路由 meta 提供 `externalUrl`。

`isCache` 第一版只定义页面缓存语义：打开过的内部页面在标签未关闭时保持组件状态。React 没有内建 Vue `KeepAlive`，因此实现一个受控缓存容器，根据 route key 保存已访问页面实例并用 CSS 隐藏非活动页。iframe 页面默认也可跟随 `isCache` 保持 iframe 不重建。

### 6. 数据迁移直接破坏式前进

项目未上线，本变更不保留旧权限点表的运行时兼容。迁移将：

- 删除 `permission_action_bindings`、`role_permissions`、`permissions` 或停止业务引用并清理代码。
- 用现有 bootstrap permission/action 生成菜单按钮 action。
- super_admin 授权所有菜单和按钮。
- chef 授权菜谱、标签、点菜、设置等菜单及对应按钮。
- diner 不授权 Admin 菜单。

## Risks / Trade-offs

- [Risk] 删除权限点后可能遗漏某些后端接口动作。→ 任务中要求逐个扫描 `@RequireAccess`，迁移为按钮 action 或菜单 key，并补测试。
- [Risk] 动态路由注册时用户直接访问深链可能早于菜单加载。→ Router bootstrap 必须在恢复会话和加载菜单后完成，期间显示启动加载态。
- [Risk] 菜单配置错 componentKey 会导致页面不可用。→ 前端 registry 白名单拒绝未知 key，菜单管理页提示 componentKey 只能选预设值。
- [Risk] React 页面缓存实现复杂。→ 第一版只支持标签内状态缓存和显式清理，不承诺跨刷新持久化。
