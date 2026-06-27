## ADDED Requirements

### Requirement: 点菜错误响应可诊断

系统 SHALL 为点菜相关接口返回可诊断的错误响应。客户端提交无效输入、未认证、权限不足、meal 不存在、dish 不存在或已停用、meal 已完成时，响应 MUST 包含稳定 HTTP 状态码和可读错误信息，供前端展示给用户。

#### Scenario: 未认证加菜
- **WHEN** 客户端未携带有效 JWT 请求 `POST /meals/:id/orders`
- **THEN** 系统返回 401，并提供可读错误信息

#### Scenario: 已完成场次加菜
- **WHEN** 已登录用户向 completed meal 加菜
- **THEN** 系统返回 409，并提供“本次点餐已完成，不能继续加菜”语义的错误信息

#### Scenario: 菜品不可点
- **WHEN** 已登录用户向 meal 添加不存在或已停用的菜品
- **THEN** 系统返回 404 或 400，并提供可读错误信息

#### Scenario: 数量不合法
- **WHEN** 已登录用户提交 quantity 小于 1 或非整数
- **THEN** 系统返回 400，并提供字段校验错误信息
