# Feed Plan Server

本目录继承仓库根目录 `AGENTS.md` 的全部约定；这里记录 NestJS 后端的补充规则。

## 技术边界

- 使用 NestJS + TypeScript，按业务领域组织 module、controller、service 和测试。
- 数据库访问通过 `@feed-plan/db` 和 `src/drizzle` 注入，不在 controller 中直接写查询。
- 请求输入优先使用 `@feed-plan/shared` 中的 Zod schema，并通过 pipe 统一校验。
- 认证和权限走 guard / decorator，不在业务方法里散落角色判断。

## 目录分层

- `src/auth`：登录、JWT、用户、角色守卫和当前用户上下文。
- `src/recipes`：菜谱、分类、食材、做法等菜谱管理能力。
- `src/meals`：场次、点餐、加菜、结单等点餐流程。
- `src/uploads`：本地图片上传、路径处理和静态资源相关能力。
- `src/common`：通用 pipe、错误转换和跨模块基础设施。
- `src/config`：环境变量 schema 和配置入口。
- `src/drizzle`：数据库 provider、连接注入和 Drizzle module。

## API 与共享类型

- 后端接口的请求/响应语义优先与 `@feed-plan/shared` 的 DTO / schema 对齐。
- 新增 REST 接口后，同步更新 `@feed-plan/api-client` resource，避免前端临时拼 URL。
- controller 负责 HTTP 协议、参数解析和权限声明；service 负责业务规则和数据库事务。
- mapper 负责数据库记录到 DTO 的转换，不把字段映射散落在 controller 和 service 中。

## 数据库

- schema 变更先更新 `packages/db/src/schema`，再生成或调整迁移。
- 涉及多表写入、点餐结单、数量累加等一致性流程时，优先使用事务。
- 查询默认按业务边界封装，避免在多个 service 中复制同一段 SQL。

## 测试

- service 规则变化补单元测试，HTTP 行为变化补 e2e 测试。
- 权限、输入校验、状态机转换和数据库错误转换是优先覆盖点。
- 涉及 server 改动后至少运行 `corepack pnpm --filter @feed-plan/server typecheck`。
