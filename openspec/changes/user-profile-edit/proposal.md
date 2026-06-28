## Why

用户管理目前只能新建、分配角色、重置密码和删除，缺少编辑用户基本信息（头像、用户名）的能力。头像能让用户在点餐场景中更好辨识彼此，用户名修改则覆盖昵称变更等常见需求。

## What Changes

- 用户表新增 `avatar` 字段，存储头像图片路径。
- 后端新增 `PATCH /users/:id` 接口，支持修改用户名（唯一性校验）和头像。
- 管理后台用户列表新增「头像」列，操作列增加「编辑」按钮，编辑抽屉支持 1:1 裁剪上传头像和修改用户名。
- 移动端个人页显示头像。

## Capabilities

### New Capabilities

- `user-profile-edit`: 用户基本信息编辑，包括头像上传（1:1 裁剪）和用户名修改（唯一性校验）。

### Modified Capabilities

- `admin-web`: 用户管理页增加编辑功能。
- `mobile-profile`: 移动端个人页显示头像。

## Impact

- `packages/db`: users 表新增 `avatar` 字段。
- `packages/shared`: 新增 `updateUserSchema`，`AdminUser` 类型增加 `avatar`。
- `packages/api-client`: users resource 新增 `update` 方法。
- `apps/server`: users controller/service 新增编辑接口。
- `apps/admin-web`: 用户列表页增加编辑抽屉、头像列。
- `apps/mobile`: 个人页显示头像。
- 依赖：管理端引入 `antd-img-crop` 支持头像裁剪。
