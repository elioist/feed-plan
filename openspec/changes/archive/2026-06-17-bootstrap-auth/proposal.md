## Why

点菜应用目前只有架构方案，尚无可运行的代码骨架与身份认证。在实现任何业务功能（菜谱管理、点餐）之前，需要先立起 Monorepo 工程骨架、可容器化运行的后端，以及区分主厨（chef）与食客（diner）的登录认证——这是后续所有功能的地基。本次变更交付这一最小可运行闭环。

## What Changes

- 新建 pnpm workspace + Turborepo 的 Monorepo 骨架：`apps/server`（NestJS）、`packages/shared`（共享类型与 Zod 校验）、`packages/db`（Drizzle schema 与 migration）。
- 抽取共享工程配置包：`packages/typescript-config`、`packages/eslint-config`、`packages/prettier-config`，统一 TS、ESLint、Prettier 规则。
- 引入 PostgreSQL，建立 `users` 表（仅认证所需，含 `role: chef | diner`）。
- 实现账号密码登录：`POST /auth/login` 校验凭据并签发 JWT；JWT 中携带用户 id 与 role。
- 实现基于角色的访问控制基座：JWT 校验守卫 + `@Roles()` 装饰器，供后续模块复用。
- 提供 `GET /auth/me` 返回当前登录用户信息。
- 通过 seed 脚本创建两个初始账号（chef、diner）。
- 提供本地 `docker-compose`（postgres + server）一键启动，验证骨架可运行。
- 本次仅建认证相关的 `users` 表；菜谱、点餐等数据表留待各自功能的独立变更。

## Capabilities

### New Capabilities
- `user-auth`: 账号密码登录、JWT 签发与校验、`chef`/`diner` 角色与基于角色的访问控制、获取当前用户信息。

### Modified Capabilities
<!-- 无既有 spec，首个变更不涉及修改 -->

## Impact

- **新增工程结构**：Monorepo 根配置（`pnpm-workspace.yaml`、`turbo.json`、`tsconfig.json`）、`apps/server`、`packages/shared`、`packages/db`、`packages/typescript-config`、`packages/eslint-config`、`packages/prettier-config`。
- **新增依赖**：NestJS、Drizzle ORM、`pg`、`@nestjs/jwt`、`bcrypt`、`zod`、ESLint、Prettier、typescript-eslint。
- **工具链约定**：共享 TS presets、ESLint flat config、Prettier 单引号配置；根脚本提供 `lint`、`typecheck`、`format`、`format:check`。
- **基础设施**：PostgreSQL 实例、`docker-compose.yml`、`.env`（JWT secret、数据库连接，不入 git）。
- **数据库**：新增 `users` 表及首个 Drizzle migration。
- **为后续解锁**：角色守卫与共享校验机制将被菜谱管理、点餐等后续变更复用。
