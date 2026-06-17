## 1. Monorepo 骨架

- [x] 1.1 初始化 git 仓库与根 `package.json`，配置 `pnpm-workspace.yaml`（`apps/*`、`packages/*`）
- [x] 1.2 配置 Turborepo（`turbo.json`：build / dev / lint 流水线）
- [x] 1.3 添加根级共享配置：`tsconfig.json`、`.gitignore`、`.npmrc`、`.editorconfig`
- [x] 1.4 创建 `packages/shared` 骨架（导出占位类型，确认可被引用）
- [x] 1.5 抽取共享 TypeScript 配置包 `@feed-plan/typescript-config`，提供 base / library / node / nest presets
- [x] 1.6 抽取共享 ESLint 配置包 `@feed-plan/eslint-config`，接入 flat config 与 workspace lint 脚本
- [x] 1.7 抽取共享 Prettier 配置包 `@feed-plan/prettier-config`，配置单引号、根 format / format:check 脚本与 `.prettierignore`
- [x] 1.8 统一根 TS 配置入口为 `tsconfig.json`，移除重复的 `tsconfig.base.json` 并更新 Dockerfile 引用

## 2. 数据库包（packages/db）

- [x] 2.1 创建 `packages/db`，安装 `drizzle-orm`、`drizzle-kit`、`pg`
- [x] 2.2 定义 `users` 表 schema（id、username 唯一、password_hash、role(chef|diner)、created_at）
- [x] 2.3 配置 `drizzle.config.ts` 与数据库连接（从 env 读取）
- [x] 2.4 生成首个 migration 并能对本地 postgres 执行成功

## 3. 共享校验（packages/shared）

- [x] 3.1 定义登录请求/响应的 Zod schema 与推导类型（loginInput、authUser、loginResponse）
- [x] 3.2 导出 role 枚举与公共类型，供前后端复用

## 4. 后端骨架与 Drizzle 集成（apps/server）

- [x] 4.1 初始化 NestJS 应用（main.ts、AppModule），接入全局校验管道
- [x] 4.2 封装 `DrizzleModule`，将 `db` 实例作为可注入 provider
- [x] 4.3 配置环境变量加载（数据库连接、JWT secret、令牌有效期）
- [x] 4.4 提供健康检查接口 `GET /health` 验证服务可启动

## 5. 认证模块（apps/server）

- [x] 5.1 实现 `UsersService`：按用户名查询用户、校验 bcrypt 密码
- [x] 5.2 实现 `AuthService`：校验凭据、签发 JWT（负载含 sub、role）
- [x] 5.3 实现 `POST /auth/login`（用 shared 的 Zod schema 校验入参）
- [x] 5.4 实现 `JwtAuthGuard`：解析并校验 Bearer 令牌，注入当前用户
- [x] 5.5 实现 `RolesGuard` 与 `@Roles()` 装饰器，按角色放行/拒绝
- [x] 5.6 实现 `GET /auth/me`（受保护，返回非敏感用户信息）

## 6. 种子与本地运行

- [x] 6.1 编写 seed 脚本：幂等创建 chef、diner 两个账号，密码经 env 注入并 bcrypt 哈希
- [x] 6.2 编写本地 `docker-compose.yml`（postgres + server），含数据卷与 env
- [x] 6.3 编写 `.env.example`，在 README 注明启动步骤（compose up → migrate → seed）
- [x] 6.4 端到端手测：登录拿令牌 → 访问 /auth/me → 用 diner 访问仅 chef 接口验证 403

## 7. 测试

- [x] 7.1 为 `AuthService`（签发/校验）与密码校验编写单元测试
- [x] 7.2 为 login、/auth/me、角色守卫编写集成测试（覆盖 200/400/401/403 路径）
- [x] 7.3 运行 `openspec validate bootstrap-auth` 并确保通过
