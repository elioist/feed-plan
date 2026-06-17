import { z } from 'zod';
import { ROLES } from './roles.js';
import type { Role } from './roles.js';

/** 角色枚举校验 */
export const roleSchema = z.enum(ROLES);

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
  role: roleSchema,
});
export type AuthUser = z.infer<typeof authUserSchema>;

/** 登录成功响应 */
export const loginResponseSchema = z.object({
  accessToken: z.string(),
  user: authUserSchema,
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;

/** JWT 负载结构 */
export interface JwtPayload {
  /** subject：用户 id */
  sub: string;
  username: string;
  role: Role;
}
