import { z } from 'zod';

const keySchema = z
  .string()
  .trim()
  .min(2, '标识至少 2 位')
  .max(64, '标识最多 64 位')
  .regex(/^[a-z][a-z0-9._:-]*$/, '标识只能包含小写字母、数字、点、下划线、冒号或短横线');

const nameSchema = z.string().trim().min(1, '名称不能为空').max(64, '名称最多 64 位');
const descriptionSchema = z.string().trim().max(255, '描述最多 255 位').optional();

export const permissionSummarySchema = z.object({
  id: z.string().uuid(),
  key: keySchema,
  name: nameSchema,
  description: z.string().nullable(),
});
export type PermissionSummary = z.infer<typeof permissionSummarySchema>;

export const roleSummarySchema = z.object({
  id: z.string().uuid(),
  key: keySchema,
  name: nameSchema,
  description: z.string().nullable(),
});
export type RoleSummary = z.infer<typeof roleSummarySchema>;

export const permissionSchema = permissionSummarySchema.extend({
  isSystem: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Permission = z.infer<typeof permissionSchema>;

export const roleSchema = roleSummarySchema.extend({
  isSystem: z.boolean(),
  permissions: z.array(permissionSummarySchema),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Role = z.infer<typeof roleSchema>;

export const accessListQuerySchema = z
  .object({
    keyword: z.string().trim().max(64).optional(),
  })
  .strip();
export type AccessListQuery = z.infer<typeof accessListQuerySchema>;

export const createRoleSchema = z.object({
  key: keySchema,
  name: nameSchema,
  description: descriptionSchema,
  permissionIds: z.array(z.string().uuid()).default([]),
});
export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = createRoleSchema.partial().extend({
  permissionIds: z.array(z.string().uuid()).optional(),
});
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

export const updateRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string().uuid()),
});
export type UpdateRolePermissionsInput = z.infer<typeof updateRolePermissionsSchema>;

export const createPermissionSchema = z.object({
  key: keySchema,
  name: nameSchema,
  description: descriptionSchema,
});
export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;

export const updatePermissionSchema = createPermissionSchema.partial();
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;

export const menuTypeSchema = z.enum(['directory', 'page']);
export type MenuType = z.infer<typeof menuTypeSchema>;

export const menuSummarySchema = z.object({
  id: z.string().uuid(),
  parentId: z.string().uuid().nullable(),
  key: keySchema,
  title: nameSchema,
  path: z.string().trim().max(128).nullable(),
  icon: z.string().trim().max(64).nullable(),
  type: menuTypeSchema,
  sortOrder: z.number().int(),
  isVisible: z.boolean(),
  isSystem: z.boolean(),
});
export type MenuSummary = z.infer<typeof menuSummarySchema>;

export const menuButtonSchema = z.object({
  id: z.string().uuid(),
  menuId: z.string().uuid(),
  key: keySchema,
  name: nameSchema,
  action: z.string().trim().min(1).max(96),
  sortOrder: z.number().int(),
  isSystem: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type MenuButton = z.infer<typeof menuButtonSchema>;

export const menuSchema = menuSummarySchema.extend({
  buttons: z.array(menuButtonSchema),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type AdminMenu = z.infer<typeof menuSchema>;

export const createMenuSchema = z.object({
  parentId: z.string().uuid().nullable().optional(),
  key: keySchema,
  title: nameSchema,
  path: z.string().trim().max(128).nullable().optional(),
  icon: z.string().trim().max(64).nullable().optional(),
  type: menuTypeSchema.default('page'),
  sortOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});
export type CreateMenuInput = z.infer<typeof createMenuSchema>;

export const updateMenuSchema = createMenuSchema.partial().refine((value) => {
  return Object.keys(value).length > 0;
}, '至少提供一个要更新的字段');
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;

export const createMenuButtonSchema = z.object({
  menuId: z.string().uuid(),
  key: keySchema,
  name: nameSchema,
  action: z.string().trim().min(1).max(96),
  sortOrder: z.number().int().min(0).default(0),
});
export type CreateMenuButtonInput = z.infer<typeof createMenuButtonSchema>;

export const updateMenuButtonSchema = createMenuButtonSchema.omit({ menuId: true }).partial().refine((value) => {
  return Object.keys(value).length > 0;
}, '至少提供一个要更新的字段');
export type UpdateMenuButtonInput = z.infer<typeof updateMenuButtonSchema>;

export const updateRoleMenusSchema = z.object({
  menuIds: z.array(z.string().uuid()),
  buttonIds: z.array(z.string().uuid()),
});
export type UpdateRoleMenusInput = z.infer<typeof updateRoleMenusSchema>;

export const roleMenuAccessSchema = z.object({
  menuIds: z.array(z.string().uuid()),
  buttonIds: z.array(z.string().uuid()),
});
export type RoleMenuAccess = z.infer<typeof roleMenuAccessSchema>;
