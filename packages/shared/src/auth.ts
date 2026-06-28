import { z } from 'zod';
import { roleSummarySchema } from './roles.js';

/** 登录请求体 */
export const loginInputSchema = z.object({
  username: z.string().min(1, '用户名不能为空').max(64),
  password: z.string().min(1, '密码不能为空').max(128),
});
export type LoginInput = z.infer<typeof loginInputSchema>;

/** 对外暴露的用户信息（不含密码哈希） */
export const authUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  avatar: z.string().nullable().optional(),
  roles: z.array(roleSummarySchema),
  actions: z.array(z.string()),
  menuKeys: z.array(z.string()),
  buttonKeys: z.array(z.string()),
});
export type AuthUser = z.infer<typeof authUserSchema>;

/** 登录成功响应 */
export const loginResponseSchema = z.object({
  accessToken: z.string(),
  user: authUserSchema,
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;

/** JWT 负载结构 */
export const jwtPayloadSchema = z.object({
  /** subject：用户 id */
  sub: z.string().uuid(),
  username: z.string(),
  roles: z.array(roleSummarySchema),
  actions: z.array(z.string()),
  menuKeys: z.array(z.string()),
  buttonKeys: z.array(z.string()),
});
export type JwtPayload = z.infer<typeof jwtPayloadSchema>;

/** 管理后台用户信息（含创建时间，不含密码哈希） */
export const adminUserSchema = authUserSchema.extend({
  createdAt: z.coerce.date(),
});
export type AdminUser = z.infer<typeof adminUserSchema>;

/** 创建用户 */
export const createUserSchema = z.object({
  username: z.string().trim().min(1, '用户名不能为空').max(64),
  password: z.string().min(6, '密码至少 6 位').max(128),
  roleIds: z.array(z.string().uuid()).min(1, '请选择至少一个角色'),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

/** 修改用户角色集合 */
export const updateUserRolesSchema = z.object({
  roleIds: z.array(z.string().uuid()).min(1, '请选择至少一个角色'),
});
export type UpdateUserRolesInput = z.infer<typeof updateUserRolesSchema>;

export const userListQuerySchema = z
  .object({
    keyword: z.string().trim().max(64).optional(),
    roleId: z.string().uuid().optional(),
  })
  .strip();
export type UserListQuery = z.infer<typeof userListQuerySchema>;

const newPasswordSchema = z.string().min(6, '密码至少 6 位').max(128);

/** 当前用户修改自己的密码 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '当前密码不能为空').max(128),
  newPassword: newPasswordSchema,
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/** 主厨重置其他用户密码 */
export const resetUserPasswordSchema = z.object({
  password: newPasswordSchema,
});
export type ResetUserPasswordInput = z.infer<typeof resetUserPasswordSchema>;

/** 编辑用户信息 */
export const updateUserSchema = z.object({
  username: z.string().trim().min(1, '用户名不能为空').max(64).optional(),
  avatar: z.string().trim().startsWith('/uploads/', '头像路径必须来自上传接口').max(255).nullable().optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
