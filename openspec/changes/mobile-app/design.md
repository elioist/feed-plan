## Context

Feed Plan 是一个家庭点菜服务，已有 NestJS 后端和 React + Vite 的 PC 管理后台。后端提供完整的 REST API（认证、菜谱、分类、菜单、订单），前端通过 `packages/shared` 共享类型定义。现需要开发移动端 App，供主厨和食客在手机上日常使用。

## Goals / Non-Goals

**Goals:**
- 使用 Expo + React Native 搭建移动端应用，接入现有后端 API
- 实现登录认证、菜谱浏览、点餐流程三个核心功能
- 复用 `packages/shared` 共享类型和 Zod 校验
- 遵循 Monorepo 结构，通过 pnpm workspace 管理依赖

**Non-Goals:**
- 不实现访客免登录点餐（H5 页面，未来单独实现）
- 不实现推送通知
- 不实现离线缓存
- 不重构后端 API

## Decisions

### 1. 路由方案：Expo Router

**选择**：Expo Router（文件式路由）
**理由**：与 admin-web 使用的 TanStack Router 理念一致，文件即路由，类型安全。Expo Router 是 Expo 官方推荐的路由方案，支持深度链接和 Web。
**备选**：React Navigation（需手动配置路由，类型安全性弱）

### 2. 状态管理：Zustand

**选择**：Zustand
**理由**：与 admin-web 保持一致，轻量且支持 TypeScript。已有 auth store 的使用经验。
**备选**：React Context（复杂状态管理不便）、Redux（过重）

### 3. 数据请求：TanStack Query

**选择**：TanStack Query
**理由**：与 admin-web 保持一致，缓存、自动刷新、乐观更新等能力成熟。
**备选**：SWR（功能较少）、直接 fetch（需自行处理缓存）

### 4. Token 存储：expo-secure-store

**选择**：expo-secure-store
**理由**：Expo 官方提供的安全存储方案，用于存储 JWT token。比 AsyncStorage 更安全。
**备选**：AsyncStorage（明文存储，不安全）

### 5. UI 组件：React Native Paper

**选择**：React Native Paper
**理由**：Material Design 风格，组件丰富，与 Expo 兼容良好。
**备选**：NativeBase（体积大）、React Native Elements（维护不活跃）

## Risks / Trade-offs

- **[风险] 移动端与 PC 端样式不一致** → 使用 React Native Paper 提供统一的 Material Design 风格，不追求与 Ant Design 完全一致
- **[风险] Expo SDK 版本升级可能导致 breaking change** → 锁定 Expo SDK 版本，定期评估升级
- **[权衡] 不实现离线缓存** → 简化首版实现，后续按需添加
