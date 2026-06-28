## 1. 数据库与共享类型

- [x] 1.1 users 表新增 `avatar` 字段（varchar，nullable）
- [x] 1.2 `packages/shared/src/auth.ts` 新增 `updateUserSchema`（username 可选、avatar 可选）
- [x] 1.3 `packages/shared/src/auth.ts` 的 `adminUserSchema` 新增 `avatar` 字段

## 2. 后端 API

- [x] 2.1 `apps/server/src/auth/users.service.ts` 新增 `update` 方法，包含用户名唯一性校验
- [x] 2.2 `apps/server/src/auth/users.controller.ts` 新增 `PATCH /:id` 接口
- [ ] 2.3 添加用户编辑的单元测试

## 3. API Client

- [x] 3.1 `packages/api-client/src/resources/users.ts` 新增 `update` 方法

## 4. 管理端前端

- [x] 4.1 安装 `antd-img-crop` 依赖
- [x] 4.2 创建 `AvatarUpload` 组件（1:1 裁剪）
- [x] 4.3 用户列表新增「头像」列
- [x] 4.4 操作列新增「编辑」按钮
- [x] 4.5 实现编辑用户抽屉（用户名 + 头像裁剪上传）
- [x] 4.6 运行 admin-web typecheck

## 5. 移动端

- [x] 5.1 个人页显示用户头像
- [x] 5.2 实现头像点击修改功能
- [x] 5.3 运行 mobile typecheck
