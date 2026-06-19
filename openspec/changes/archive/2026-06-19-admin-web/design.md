## Context

项目已完成并归档 `user-auth`、`recipe-management`、`meal-ordering` 三个后端能力，当前 API 已覆盖登录、当前用户、分类、菜谱、做法步骤、点菜和菜单查询。下一步需要 PC 管理后台，让主厨通过浏览器完成日常录入与查看，而不是继续依赖 curl。

本变更遵循用户确认的 A 方案，并按后续要求更新为：React + Vite + TypeScript + Ant Design + TanStack Router + TanStack Query + ofetch + Zustand。脚手架参考 `condorheroblog/react-antd-admin` 的中后台组织边界，但不复制代码，保持项目自有的 monorepo、共享配置和 OpenSpec 流程。

## Goals / Non-Goals

**Goals:**

- 新增 `apps/admin-web`，作为 PC 管理后台首版应用。
- 接入 monorepo 的 pnpm workspace、Turborepo、TypeScript、ESLint、Prettier 配置包。
- 提供登录、退出、会话恢复、401 跳转登录。
- 提供后台布局、受保护路由、导航菜单和基础错误/加载状态。
- 提供分类管理、菜谱管理、富文本菜谱内容编辑、封面上传、点菜菜单查看页面。
- 复用 `@feed-plan/shared` 的类型与 schema，避免前后端类型漂移。
- 在实施前先确认目录结构；实施时不引入未经确认的替代技术栈。

**Non-Goals:**

- 不实现移动端 App 和访客 H5。
- 不实现移动端侧图片裁剪、压缩和复杂素材库管理；封面仅支持基础图片上传。
- 不实现免登录分享、访客点菜和 share_links。
- 不继续将后台录入体验绑定到结构化食材克数和逐步做法；新项目直接移除后台相关兼容路径。
- 不做复杂视觉设计稿，使用 Ant Design 默认风格快速成型。

## Decisions

### 决策 1：轻量自建 Vite 后台

- **选择**：`apps/admin-web` 使用 Vite + React + TypeScript，自建路由、请求、状态和页面边界。
- **替代方案**：Ant Design Pro/Umi 更完整但较重；Refine CRUD 快但资源模型会影响后续定制点菜流程。
- **理由**：当前项目是 pnpm workspace + Turbo，已有共享配置包。轻量 Vite 应用最容易融入现有结构，也方便后续拆分移动端和 H5。

### 决策 2：Ant Design 作为 UI 基座

- **选择**：使用 Ant Design 组件构建后台布局、表格、表单、弹窗、菜单和反馈状态。
- **理由**：项目约定 PC 管理后台使用 Ant Design；首版重点是可用性和效率，不做重视觉定制。
- **取舍**：页面会偏默认后台风格，但迭代速度快，适合当前阶段。

### 决策 3：TanStack Router 构建文件式路由

- **选择**：使用 TanStack Router 的文件式路由 API，首版提交手写 `routeTree.gen.ts` 以保持可验证；后续如安装器稳定，可再接入 TanStack Router Vite plugin 自动生成。
- **替代方案**：React Router 更常见但类型安全和 loader/cache 协调弱；手写路由树样板更多。
- **理由**：管理后台需要登录保护、搜索参数校验、列表筛选和页面级数据预取。TanStack Router 能把路径、params、search、loader 和导航类型统一起来。
- **约束**：router context MUST 注入 QueryClient 和 auth 状态；受保护页面使用 pathless layout route 做登录校验；router 设置 `defaultPreload: 'intent'`、`defaultPreloadStaleTime: 0`、`scrollRestoration: true`。

### 决策 4：TanStack Query 管服务器状态

- **选择**：分类、菜谱、菜单等服务端数据通过 TanStack Query 获取、缓存和失效。
- **理由**：管理后台以远端 CRUD 为主，Query 能统一加载、错误、刷新和 mutation 后失效。
- **取舍**：比直接在页面里 `useEffect` 请求多一个依赖，但能减少后续页面重复逻辑。

### 决策 5：TanStack Query 与 Router 协调数据加载

- **选择**：列表/详情 route loader 使用 `queryClient.ensureQueryData(queryOptions)` 预取关键数据，页面组件使用 `useSuspenseQuery` 或 `useQuery` 读取同一个 Query cache。
- **理由**：Query 作为唯一缓存源，避免 Router cache 与 Query cache 双缓存。mutation 成功后通过 `invalidateQueries` 刷新对应列表/详情。
- **取舍**：需要为 categories、dishes、meals 等 feature 定义 queryOptions 工厂，但路由加载和组件读取会更一致。

### 决策 6：ofetch 作为请求层

- **选择**：使用 `ofetch.create` 封装 baseURL、Authorization header、JSON 请求、响应错误和 401 会话清理。
- **替代方案**：axios 插件生态丰富，但当前需求以 REST JSON 为主；原 fetch/ky 方案已被用户明确改为 ofetch。
- **理由**：ofetch API 轻量，默认 JSON 解析和非 2xx 抛错适合管理后台 API client。

### 决策 7：Zustand 只放本地会话状态

- **选择**：JWT、当前用户和登录状态放在 `features/auth/store.ts`；服务端列表/详情不放 Zustand。
- **理由**：避免把远端状态复制到本地全局 store，减少缓存不一致。
- **取舍**：页面获取业务数据必须通过 Query hook，但边界更清楚。

### 决策 8：目录按页面、业务 feature、共享基础设施分层

首版目录结构固定为：

```txt
apps/
  admin-web/
    index.html
    package.json
    tsconfig.json
    vite.config.ts
    src/
      main.tsx
      app/
        App.tsx
        providers.tsx
        router.tsx
        query-client.ts
      routes/
        __root.tsx
        login.tsx
        _authenticated.tsx
        _authenticated/
          index.tsx
          categories.tsx
          dishes.tsx
          dishes.new.tsx
          dishes.$dishId.edit.tsx
          meals.tsx
          meals.$mealId.tsx
      layouts/
        AdminLayout.tsx
        AuthLayout.tsx
      pages/
        login/
          LoginPage.tsx
        dashboard/
          DashboardPage.tsx
        categories/
          CategoryListPage.tsx
        dishes/
          DishListPage.tsx
          DishCreatePage.tsx
          DishEditPage.tsx
        meals/
          MealListPage.tsx
          MealDetailPage.tsx
      features/
        auth/
          api.ts
          store.ts
          types.ts
        categories/
          api.ts
          components/
        dishes/
          api.ts
          components/
        meals/
          api.ts
          components/
      shared/
        api/
          client.ts
          errors.ts
        components/
          PageHeader.tsx
          ProtectedRoute.tsx
        config/
          env.ts
        hooks/
        utils/
      styles/
        global.css
```

- **理由**：`pages` 负责页面编排，`features` 负责业务 API 与局部组件，`shared` 放跨业务基础设施。参考开源后台模板常见边界，但保持文件小而清晰。
- **约束**：搭建框架前应先按此目录结构创建应用；如实施中需要新增目录，必须服务于明确页面或共享基础设施。

### 决策 9：API client 统一处理认证与错误

- **选择**：`shared/api/client.ts` 使用 ofetch 封装 base URL、JSON 请求、Authorization header 和 401 处理；各 feature 只声明资源函数。
- **理由**：后端所有业务 API 都要求 JWT，统一 client 可以减少重复和漏处理。
- **取舍**：首版不引入自动代码生成；类型从 `@feed-plan/shared` 导入。

### 决策 10：后台二期先修地基，再升级页面体验

- **选择**：按“基础修复 → UI 基座 → 表格 CRUD → 业务扩展”的顺序推进。
- **理由**：当前 Vite config、TanStack Router 类型注册和会话恢复会影响所有页面；先修这些问题，再迁移 ProTable、主题和新业务字段，能减少返工。
- **阶段 A 基础修复**：统一 catalogs；修复 `vite.config.ts` 的 Vitest 类型；补 React/Tailwind Vite 插件；修复 Router 类型生成/注册；刷新页面时恢复当前用户；逐步改用 `~` alias 并移除不必要的本地 `.js` 后缀。
- **阶段 B UI 基座**：引入 Ant Design icons、ProComponents 和 Tailwind v4。Tailwind 只导入 theme/utilities 层，避免 Preflight 与 Ant Design 基础样式冲突；页面外壳采用类似 Ant Design Pro 的侧栏、顶部栏、PageContainer/Card、面包屑、页签和回到顶部。
- **阶段 C 表格 CRUD**：分类、菜谱、菜单等查询页迁移到 ProTable 或统一表格封装，提供查询、重置、完整分页、加载/空状态、删除/停用确认和 URL search 同步。
- **阶段 D 业务扩展**：新增菜品标签、忌口、用户管理、角色管理、系统设置和主题切换。涉及后端契约、数据库迁移和共享 schema 的能力必须与 UI 同步落地。

### 决策 11：ProComponents 而不是整套 Ant Design Pro 脚手架

- **选择**：接入 `@ant-design/pro-components`，优先使用 `PageContainer`、`ProCard`、`ProTable`、`ProForm` 等组件。
- **替代方案**：整套 Ant Design Pro/Umi 模板功能完整，但会引入路由、构建和权限体系迁移成本。
- **理由**：当前应用已经确定为 Vite + TanStack Router。使用 ProComponents 可以获得 Ant Design Pro 的页面和表格体验，同时保留现有架构。

### 决策 12：目录扁平化只作用于 admin-web 本地代码

- **选择**：保留仓库级 `packages/shared` 作为前后端共享 Zod/type 契约；将 `apps/admin-web/src/shared` 后续迁移为 `src/api`、`src/components`、`src/hooks`、`src/lib` 等更适合单一后台应用的目录。
- **理由**：仓库级 shared 是项目约定；admin 本地 shared 只是应用内部基础设施，扁平化后更短、更符合后台维护习惯。
- **约束**：迁移导入时使用 `~` alias，不再新增深层相对路径；生成文件除外。

## Risks / Trade-offs

- **[富文本内容可能带来 XSS 风险]** → 后端和前端展示 MUST 使用白名单清洗或安全渲染策略，不直接信任任意 HTML。
- **[图片上传带来安全风险]** → 上传 MUST 限制 MIME、扩展名和大小，生成服务端文件名，禁止按原始文件名落盘。
- **[JWT 存 localStorage 有 XSS 风险]** → 首版为本地家庭应用接受该取舍；后续若开放外网再评估 httpOnly cookie。
- **[过早做复杂 dashboard]** → Dashboard 只做入口和今日菜单摘要，不做图表。
- **[Tailwind 与 Ant Design 样式冲突]** → 首期不导入 Tailwind Preflight，只使用 theme/utilities；组件主样式仍走 Ant Design token。
- **[ProComponents 增加依赖体积]** → 仅在后台管理页使用，优先解决表格查询和页面容器体验，不迁移到移动端或访客 H5。
- **[ProComponents 对 antd 6 的 peer 声明滞后]** → 当前 `@ant-design/pro-components@2.8.10` peer 仍声明支持 antd 4/5，接入后必须先小范围验证；如出现兼容问题，优先使用 antd Table/Card/Form 自建统一封装，等待 ProComponents 官方支持 antd 6 后再迁移。

## Migration Plan

1. 新增 `apps/admin-web` 应用骨架并接入 workspace。
2. 安装并配置已确认技术栈依赖。
3. 实现认证、布局和路由基座。
4. 分批实现分类、菜谱、菜单页面。
5. 补充 README 运行说明和验证命令。
6. 后台二期整改按阶段推进：基础修复、UI 基座、表格 CRUD、业务扩展。
7. 通过 format、lint、typecheck、test、build 与 OpenSpec strict validate 后归档。

回滚时删除 `apps/admin-web` 及相关 workspace/turbo 配置变更，不涉及数据库。

## Open Questions

- 首版后台是否只允许 `chef` 登录使用，还是允许 `diner` 登录后只读查看菜单？设计默认后台主要服务 `chef`，如果 diner 访问管理页面应隐藏管理入口或显示无权限。
