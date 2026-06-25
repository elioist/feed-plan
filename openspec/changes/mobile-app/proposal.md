## Why

PC 管理后台已完成主厨的菜谱管理能力，但食客和主厨在手机端仍无法浏览菜谱、点餐和查看今日菜单。移动端 App 是产品的核心使用场景——家庭点菜服务的日常交互主要发生在手机上。

## What Changes

- 新增 `apps/mobile` 目录，使用 Expo + React Native 搭建移动端应用骨架
- 实现登录认证流程，复用现有后端 `POST /auth/login` 与 `GET /auth/me` 接口
- 实现菜谱浏览：按分类查看菜谱列表、搜索、查看菜谱详情（食材、做法、B 站视频）
- 实现今日菜单：查看当前场次菜单、已完成的历史菜单
- 实现点餐流程：主厨开单（创建 meal）、任何人加菜（追加 order）、主厨结单
- 接入 Expo Router 实现文件式路由导航

## Capabilities

### New Capabilities
- `mobile-auth`: 移动端登录认证流程，包括登录表单、Token 存储、会话恢复、自动登出
- `mobile-recipe-browse`: 菜谱浏览与详情查看，包括分类筛选、搜索、菜谱详情页（食材、做法、视频链接）
- `mobile-meal-ordering`: 点餐流程，包括查看今日菜单、主厨创建场次、加菜、查看订单、主厨完成点餐

### Modified Capabilities

（无需修改现有 spec，移动端复用已有后端 API）

## Impact

- **代码**：新增 `apps/mobile` 目录（Expo 项目）
- **依赖**：新增 Expo、React Native、Expo Router、AsyncStorage 等移动端依赖
- **后端**：无改动，移动端复用现有 REST API
- **Monorepo**：`pnpm-workspace.yaml` 需新增 `apps/mobile` 工作区
- **共享类型**：复用 `packages/shared` 中的类型定义
