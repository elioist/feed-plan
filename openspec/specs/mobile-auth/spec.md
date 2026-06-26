# mobile-auth Specification

## Purpose
TBD - created by archiving change mobile-app. Update Purpose after archive.
## Requirements
### Requirement: 登录表单

系统 SHALL 提供移动端登录页面，包含用户名和密码输入框，以及登录按钮。用户提交凭据后，系统 SHALL 调用 `POST /auth/login` 接口进行认证。

#### Scenario: 登录成功
- **WHEN** 用户输入正确的用户名和密码并点击登录
- **THEN** 系统将 JWT token 存储到 SecureStore，跳转到主页

#### Scenario: 登录失败
- **WHEN** 用户输入错误的用户名或密码并点击登录
- **THEN** 系统显示错误提示"用户名或密码错误"，停留在登录页

#### Scenario: 输入校验
- **WHEN** 用户未输入用户名或密码就点击登录
- **THEN** 系统显示"请输入用户名"和"请输入密码"的校验提示

### Requirement: Token 安全存储

系统 SHALL 使用 expo-secure-store 存储 JWT token，MUST NOT 使用 AsyncStorage 等明文存储方案。

#### Scenario: 登录后存储 token
- **WHEN** 登录成功获取到 JWT token
- **THEN** 系统将 token 存入 SecureStore，key 为 `access_token`

#### Scenario: 退出登录清除 token
- **WHEN** 用户点击退出登录
- **THEN** 系统从 SecureStore 中移除 `access_token`，跳转到登录页

### Requirement: 会话恢复

系统 SHALL 在应用启动时检查 SecureStore 中是否存在有效 token，若存在则自动恢复登录状态。

#### Scenario: 有效 token 自动登录
- **WHEN** 应用启动且 SecureStore 中存在有效 token
- **THEN** 系统调用 `GET /auth/me` 获取用户信息，直接进入主页

#### Scenario: 无效 token 跳转登录
- **WHEN** 应用启动且 SecureStore 中的 token 已过期或无效
- **THEN** 系统清除无效 token，跳转到登录页

### Requirement: 退出登录

系统 SHALL 提供退出登录功能，清除本地存储的 token 并跳转到登录页。

#### Scenario: 主动退出
- **WHEN** 用户在个人中心点击"退出登录"
- **THEN** 系统清除 SecureStore 中的 token，清除用户状态，跳转到登录页
