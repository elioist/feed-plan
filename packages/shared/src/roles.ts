import { z } from 'zod';

const keySchema = z
  .string()
  .trim()
  .min(2, '标识至少 2 位')
  .max(64, '标识最多 64 位')
  .regex(/^[a-z][a-z0-9._:-]*$/, '标识只能包含小写字母、数字、点、下划线、冒号或短横线');

const nameSchema = z.string().trim().min(1, '名称不能为空').max(64, '名称最多 64 位');
const descriptionSchema = z.string().trim().max(255, '描述最多 255 位').optional();
const nullablePathSchema = z.string().trim().min(1).max(128).nullable();
const nullableIconSchema = z.string().trim().min(1).max(64).nullable();
const nullableComponentKeySchema = keySchema.nullable();
const nullableUrlSchema = z.string().trim().url('外链地址必须是合法 URL').max(512).nullable();
const actionSchema = z.string().trim().min(1, '动作不能为空').max(96, '动作最多 96 位');

export const roleSummarySchema = z.object({
  id: z.string().uuid(),
  key: keySchema,
  name: nameSchema,
  description: z.string().nullable(),
});
export type RoleSummary = z.infer<typeof roleSummarySchema>;

export const roleSchema = roleSummarySchema.extend({
  isSystem: z.boolean(),
  menuIds: z.array(z.string().uuid()),
  buttonIds: z.array(z.string().uuid()),
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
  menuIds: z.array(z.string().uuid()).default([]),
  buttonIds: z.array(z.string().uuid()).default([]),
});
export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = createRoleSchema.partial().extend({
  menuIds: z.array(z.string().uuid()).optional(),
  buttonIds: z.array(z.string().uuid()).optional(),
});
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

export const menuTypeSchema = z.enum(['directory', 'page', 'iframe', 'link']);
export type MenuType = z.infer<typeof menuTypeSchema>;

export const menuLayoutSchema = z.enum(['admin', 'blank']);
export type MenuLayout = z.infer<typeof menuLayoutSchema>;

export const menuSummarySchema = z.object({
  id: z.string().uuid(),
  parentId: z.string().uuid().nullable(),
  key: keySchema,
  title: nameSchema,
  path: nullablePathSchema,
  icon: nullableIconSchema,
  type: menuTypeSchema,
  componentKey: nullableComponentKeySchema,
  externalUrl: nullableUrlSchema,
  openInNewTab: z.boolean(),
  layoutKey: menuLayoutSchema,
  isCache: z.boolean(),
  isTabVisible: z.boolean(),
  isAffix: z.boolean(),
  activeMenuKey: keySchema.nullable(),
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
  action: actionSchema,
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

const menuInputShape = {
  parentId: z.string().uuid().nullable().optional(),
  key: keySchema,
  title: nameSchema,
  path: z.string().trim().min(1).max(128).nullable().optional(),
  icon: z.string().trim().min(1).max(64).nullable().optional(),
  type: menuTypeSchema.default('page'),
  componentKey: keySchema.nullable().optional(),
  externalUrl: z.string().trim().url('外链地址必须是合法 URL').max(512).nullable().optional(),
  openInNewTab: z.boolean().default(false),
  layoutKey: menuLayoutSchema.default('admin'),
  isCache: z.boolean().default(false),
  isTabVisible: z.boolean().default(true),
  isAffix: z.boolean().default(false),
  activeMenuKey: keySchema.nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
};

function validateMenuRoute(value: {
  type?: MenuType;
  path?: string | null;
  componentKey?: string | null;
  externalUrl?: string | null;
}) {
  const type = value.type ?? 'page';
  if (type === 'page') {
    return Boolean(value.path && value.componentKey);
  }
  if (type === 'iframe') {
    return Boolean(value.path && value.externalUrl);
  }
  if (type === 'link') {
    return Boolean(value.externalUrl);
  }
  return true;
}

export const createMenuSchema = z.object(menuInputShape).refine(validateMenuRoute, {
  message: '页面菜单需要 path 和 componentKey；iframe 需要 path 和 externalUrl；外链需要 externalUrl',
});
export type CreateMenuInput = z.infer<typeof createMenuSchema>;

export const updateMenuSchema = z.object(menuInputShape).partial().refine((value) => {
  return Object.keys(value).length > 0;
}, '至少提供一个要更新的字段').refine(validateMenuRoute, {
  message: '页面菜单需要 path 和 componentKey；iframe 需要 path 和 externalUrl；外链需要 externalUrl',
});
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;

export const createMenuButtonSchema = z.object({
  menuId: z.string().uuid(),
  key: keySchema,
  name: nameSchema,
  action: actionSchema,
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

export type AuthMenu = MenuSummary & {
  buttons: MenuButton[];
  children: AuthMenu[];
};

export const authMenuSchema: z.ZodType<AuthMenu> = menuSummarySchema.extend({
  buttons: z.array(menuButtonSchema),
  children: z.lazy(() => z.array(authMenuSchema)),
});
