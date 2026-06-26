# Feed Plan Packages

本目录继承仓库根目录 `AGENTS.md` 的全部约定；这里记录 workspace 公共包的补充规则。

## 包职责

- `api-client`：前端请求封装、resource 分组、请求/响应错误类型；不得依赖任何具体 app。
- `shared`：跨端 DTO、Zod schema、枚举、常量和纯函数；不得依赖 React、React Native、NestJS、Drizzle 或浏览器 API。
- `db`：Drizzle schema、数据库连接、迁移相关能力；只服务后端和数据库工具链。
- `eslint-config`、`typescript-config`、`prettier-config`：工程配置包，只放配置，不放业务逻辑。

## 拆包规则

- 新能力先判断是否真的跨端复用；只有被两个以上 app / package 使用，或承载明确边界时，才放入 `packages`。
- DTO、请求参数和响应类型优先与 Zod schema 放在一起，避免 app 内重复声明。
- 公共包不得反向依赖 `apps/*`；依赖方向必须保持 `apps` → `packages`。
- 公共包导出保持小而明确，通过 `src/index.ts` 暴露稳定 API，不暴露内部目录结构。
- 新增 package 时同步配置 `package.json` 的 `exports`、`types`、`files` 和 `typecheck` 脚本。

## API Client

- 每个业务资源放在 `packages/api-client/src/resources/<resource>.ts`。
- 新接口先在 resource 中封装，再由 admin / mobile 的 `queries` 或 hooks 消费。
- API client 只处理 baseURL、token 注入、请求错误和资源方法，不处理页面跳转、toast 或端侧状态。
- 资源方法命名使用业务动作：`list`、`get`、`create`、`update`、`remove`、`complete`，避免暴露 HTTP 细节。

## Shared

- 跨端常量放 `packages/shared/src/constants.ts` 或按领域拆分后从 `src/index.ts` 导出。
- 纯函数必须无副作用，不读取环境变量、不访问 storage、不发请求。
- schema 与类型命名保持领域语义，例如 `DishListQuery`、`CreateMealInput`、`MealStatus`。
- 添加工具函数前先调研标准库和现有依赖；只有项目内语义明确、依赖成本不划算时才自实现。

## 验证

- 修改 `api-client` 后运行 `corepack pnpm --filter @feed-plan/api-client typecheck`。
- 修改 `shared` 后运行 `corepack pnpm --filter @feed-plan/shared typecheck` 和相关测试。
- 修改 `db` schema 后运行 `corepack pnpm --filter @feed-plan/db typecheck`，并确认迁移策略。
