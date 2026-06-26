# Feed Plan Admin Web

本目录继承仓库根目录 `AGENTS.md` 的全部约定；这里仅记录 PC 管理后台的补充规则。

## 技术边界

- 使用 React + Vite + TypeScript，组件库优先使用 Ant Design / ProComponents。
- 路由使用 TanStack Router，路由文件放在 `src/routes`，页面实现放在 `src/pages`。
- 需要 JSX 的文件使用 `.tsx`，纯工具、配置、类型文件使用 `.ts`。
- 新增三方库前先确认 `apps/admin-web/package.json` 是否已有依赖；能用 Ant Design 或现有工具解决的，不额外引入 UI 依赖。

## 目录分层

- `src/routes`：路由定义、布局路由和路由守卫。
- `src/pages`：页面级业务实现，按业务模块拆分。
- `src/components`：可复用组件；`core` 放通用基础组件，`biz` 放业务组件。
- `src/providers`：全局 Provider，如 QueryClient、主题、应用级上下文。
- `src/queries`：TanStack Query 查询封装和 query key，页面不直接拼请求。
- `src/store`：客户端状态，如登录用户、设置、主题偏好。
- `src/config`：环境变量、后台布局和运行时配置。
- `src/enums`：后台端枚举；跨端枚举优先放 workspace 公共包。
- `src/lib`：后台端基础设施封装，如 API client、storage、错误解析、通用工具。
- `src/hooks`：后台端可复用 hooks。
- `src/styles`：全局样式和 Tailwind / Ant Design 样式入口。

## API 与数据

- 不在 admin 内新增 `api` 目录或本地 HTTP client。
- 后端请求统一从 `@feed-plan/api-client` 引入，并通过 `src/lib/api-client.ts` 注入后台端配置。
- 新增接口先落到 `@feed-plan/api-client`，再在 `src/queries` 中封装对应 query / mutation。
- DTO、请求参数、响应类型优先从 `@feed-plan/api-client` 或 `@feed-plan/shared` 引入，不在页面里重复声明。
- 页面组件只消费 query / mutation 和视图模型，不直接处理 token、baseURL、HTTP 错误解析。

## 状态与缓存

- 服务器状态使用 `@tanstack/react-query`，query key 与 `src/queries` 中的封装保持稳定命名。
- 客户端状态使用 Zustand，按 `src/store/modules` 拆分；不要把服务端列表、详情数据塞进 store。
- token 和本地偏好通过 `src/lib/storage.ts` 统一读写；storage key 前缀优先使用公共包 constants。
- 表格筛选、分页、排序优先与 URL search params 或页面局部状态绑定，避免全局化。

## UI 约定

- 后台界面以高效录入、管理和扫描为主，优先使用 Ant Design 的表格、表单、弹窗、抽屉、消息反馈。
- 页面布局保持工作台风格，避免营销页式 hero、大面积装饰卡片和无业务意义的动效。
- 表单字段、列表列和操作按钮应贴近主厨管理菜谱、分类、做法、菜单的真实流程。
- 图标优先使用 `@ant-design/icons`；已有 Iconify 使用场景可继续沿用，但同一组件内不要混用多个图标风格。

## 验证

- 涉及 admin 改动后至少运行 `corepack pnpm --filter @feed-plan/admin-web typecheck`。
- 修改查询、页面交互或 store 时，补充或更新对应 Vitest 测试。
- 修改共享 API 或 DTO 时，同时运行对应 package 的 typecheck。
