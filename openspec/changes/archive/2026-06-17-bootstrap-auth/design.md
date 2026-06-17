## Context

点菜应用采用前后端分离 + Monorepo 架构，全程 TypeScript。本次变更是项目的第一个 change，目标是立起可运行的工程骨架与认证地基，供后续所有功能复用。使用者仅两人（主厨、食客），无高并发需求，设计以"简单可维护、部署轻量"为首要原则，避免过度工程化。

技术栈已冻结：NestJS + Drizzle ORM + PostgreSQL，pnpm workspace + Turborepo，Docker 容器化部署至阿里云。

## Goals / Non-Goals

**Goals:**
- 建立 Monorepo 骨架：`apps/server`、`packages/shared`、`packages/db`，可被后续 apps（admin、mobile）扩展。
- 建立可复用工程配置：TypeScript、ESLint、Prettier 均抽取为 workspace 内部配置包。
- 跑通 NestJS + Drizzle + PostgreSQL，本地 `docker-compose` 一键启动。
- 实现账号密码登录、JWT 签发与校验、chef/diner 角色与基于角色的访问控制。
- 建立 `users` 表与首个 migration、seed 脚本。
- 提供可被后续模块复用的认证基座（JWT 守卫、`@Roles()` 装饰器、共享 Zod 校验）。

**Non-Goals:**
- 不实现菜谱、点餐等业务表与接口（留待各自独立 change）。
- 不实现注册 / 改密 / 找回密码（两个固定账号，由 seed 创建）。
- 不实现免登录访客通道（属于未来分享功能）。
- 不搭建 admin、mobile 前端 app（后续 change）。
- 不做生产部署（M5 处理），本次仅本地容器跑通。

## Decisions

### 决策 1：用 Drizzle 而非 TypeORM/Prisma
- **选择**：Drizzle ORM，封装一个 NestJS `DrizzleModule` 将 `db` 实例作为 provider 注入。
- **理由**：类型安全、贴近原生 SQL、schema 即代码、migration 透明。Drizzle 非 NestJS 官方默认，但通过自定义 module 注入是社区成熟做法。
- **取舍**：放弃 NestJS 装饰器实体（TypeORM）的便利，换取更可控的查询与更轻的运行时。

### 决策 2：JWT 无状态认证
- **选择**：`@nestjs/jwt` 签发短期访问令牌，负载含 `sub`(用户 id) 与 `role`。守卫从 `Authorization: Bearer` 解析校验。
- **理由**：两人使用，无需服务端 session 存储；无状态最简单。
- **取舍**：本期不做 refresh token 轮换（令牌有效期设置得相对宽松，后续如需再加）。

### 决策 3：角色控制用 Guard + 装饰器
- **选择**：`JwtAuthGuard`（校验登录）+ `RolesGuard` 配合 `@Roles()` 元数据装饰器（校验角色）。
- **理由**：NestJS 惯用模式，声明式、可组合，后续模块直接复用。
- **替代方案**：在每个 handler 内手写判断——被否决，重复且易遗漏。

### 决策 4：共享校验放 packages/shared
- **选择**：登录等 DTO 的 Zod schema 与 TS 类型置于 `packages/shared`，后端校验入参、前端复用类型。
- **理由**：Monorepo 全栈 TS 的核心红利，单一真相源，避免前后端类型漂移。

### 决策 5：密码哈希用 bcrypt
- **选择**：bcrypt 哈希存储密码；初始密码经环境变量传入 seed。
- **理由**：成熟、自带盐、抗暴力。绝不明文、绝不硬编码。

### 决策 6：工程配置抽成 workspace 内部包
- **选择**：新增 `@feed-plan/typescript-config`、`@feed-plan/eslint-config`、`@feed-plan/prettier-config`，由根项目和各 workspace package 通过 package exports 消费。
- **理由**：后续会增加 server、admin、mobile、shared、db 等多个包；统一配置能避免每个包复制 TS/ESLint/Prettier 规则，也让新增 app 时只需选择已有 preset。
- **取舍**：初期多了几个配置包，但规则边界更清楚。TS 仅保留根 `tsconfig.json` 作为统一入口，避免 `tsconfig.json` 与 `tsconfig.base.json` 并存造成认知负担。

## Risks / Trade-offs

- **[Drizzle 与 NestJS 集成非官方]** → 通过 `DrizzleModule` provider 模式封装，参考社区方案，风险可控。
- **[无 refresh token，令牌过期需重新登录]** → 两人自用场景可接受；令牌有效期适当放宽，后续按需迭代。
- **[seed 密码管理]** → 经 `.env` 注入、不入 git；首次部署后建议主厨在后续改密功能上线前妥善保管。
- **[Monorepo 初期复杂度]** → 仅先建 server + 2 个 package，最小化骨架，admin/mobile 后续按需加入。
- **[配置包初期显得偏重]** → 配置入口保持很薄，只沉淀会被多个包复用的规则；后续 React/Vite/Expo preset 按实际 app 出现再补。

## Migration Plan

- 本次为全新项目，无存量数据迁移。
- 部署步骤（本地）：`docker-compose up` 启动 postgres 与 server → 运行 Drizzle migration 建 `users` 表 → 运行 seed 创建初始账号。
- 回滚：删除容器与数据卷即可，无外部副作用。

## Open Questions

- 令牌有效期具体设多长（如 7d / 30d）？倾向偏长以减少重复登录，实现时定一个默认值，可配置。
- migration 在容器启动时自动执行还是手动触发？倾向开发期手动、部署脚本中显式执行，避免启动副作用。
