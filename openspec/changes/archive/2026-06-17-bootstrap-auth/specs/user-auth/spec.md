## ADDED Requirements

### Requirement: 账号密码登录

系统 SHALL 提供 `POST /auth/login` 接口，接受用户名与密码，校验通过后签发 JWT。密码 MUST 以哈希形式存储（bcrypt），严禁明文。校验失败时 MUST 返回 401，且错误信息 MUST NOT 透露是用户名还是密码错误。

#### Scenario: 凭据正确登录成功
- **WHEN** 客户端以正确的用户名和密码请求 `POST /auth/login`
- **THEN** 系统返回 200，响应体包含 JWT 访问令牌，令牌负载携带用户 id 与 role

#### Scenario: 密码错误登录失败
- **WHEN** 客户端以存在的用户名但错误的密码请求 `POST /auth/login`
- **THEN** 系统返回 401，且不区分地提示“用户名或密码错误”

#### Scenario: 用户名不存在登录失败
- **WHEN** 客户端以不存在的用户名请求 `POST /auth/login`
- **THEN** 系统返回 401，且不区分地提示“用户名或密码错误”

#### Scenario: 请求体不合法
- **WHEN** 客户端提交缺少用户名或密码的请求体
- **THEN** 系统返回 400，并说明缺失字段

### Requirement: JWT 校验与受保护接口

系统 SHALL 通过 JWT 校验守卫保护需要登录的接口。携带有效令牌的请求 MUST 被放行并可获取当前用户身份；缺失或无效令牌的请求 MUST 返回 401。

#### Scenario: 携带有效令牌访问受保护接口
- **WHEN** 客户端在 `Authorization: Bearer <token>` 头中携带有效 JWT 访问受保护接口
- **THEN** 系统放行请求，并在请求上下文中提供当前用户 id 与 role

#### Scenario: 缺失令牌访问受保护接口
- **WHEN** 客户端未携带 `Authorization` 头访问受保护接口
- **THEN** 系统返回 401

#### Scenario: 令牌无效或过期
- **WHEN** 客户端携带被篡改、签名不符或已过期的 JWT
- **THEN** 系统返回 401

### Requirement: 角色与基于角色的访问控制

系统 SHALL 支持 `chef` 与 `diner` 两种角色，并提供 `@Roles()` 装饰器声明接口所需角色。角色不满足的请求 MUST 返回 403。

#### Scenario: 主厨访问仅主厨接口
- **WHEN** 角色为 `chef` 的用户访问标注了 `@Roles('chef')` 的接口
- **THEN** 系统放行请求

#### Scenario: 食客访问仅主厨接口被拒
- **WHEN** 角色为 `diner` 的用户访问标注了 `@Roles('chef')` 的接口
- **THEN** 系统返回 403

#### Scenario: 任意登录角色访问无角色限制的受保护接口
- **WHEN** 任一已登录用户（chef 或 diner）访问仅要求登录、未限制角色的接口
- **THEN** 系统放行请求

### Requirement: 获取当前用户信息

系统 SHALL 提供 `GET /auth/me` 接口，返回当前登录用户的非敏感信息（id、用户名、role），且 MUST NOT 返回密码哈希。

#### Scenario: 已登录获取自身信息
- **WHEN** 已登录用户携带有效令牌请求 `GET /auth/me`
- **THEN** 系统返回 200，响应体包含 id、用户名、role，不含密码哈希

#### Scenario: 未登录获取自身信息
- **WHEN** 未携带有效令牌请求 `GET /auth/me`
- **THEN** 系统返回 401

### Requirement: 初始账号种子

系统 SHALL 提供 seed 脚本，创建两个初始账号：一个 `chef`（本人）与一个 `diner`（女友）。脚本 MUST 可重复执行而不产生重复用户（按用户名幂等）。初始密码 MUST 来自环境变量或运行时输入，MUST NOT 硬编码在代码库中。

#### Scenario: 首次执行 seed
- **WHEN** 在空的 users 表上执行 seed 脚本
- **THEN** 系统创建一个 chef 账号与一个 diner 账号，密码以 bcrypt 哈希存储

#### Scenario: 重复执行 seed
- **WHEN** 在已存在初始账号的情况下再次执行 seed 脚本
- **THEN** 系统不创建重复账号，已有账号保持不变
