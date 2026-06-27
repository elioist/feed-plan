import bcrypt from 'bcrypt';
import { and, eq } from 'drizzle-orm';
import {
  adminMenuButtons,
  adminMenus,
  createDb,
  permissionActionBindings,
  permissions,
  roleMenuButtons,
  roleMenus,
  rolePermissions,
  roles,
  tags,
  userRoles,
  users,
  type Database,
} from '@feed-plan/db';
import { ACCESS_ACTIONS } from './auth/access-actions.js';

const bootstrapPermissions = [
  {
    key: 'users.manage',
    name: '用户管理',
    description: '新增、搜索、删除用户，维护用户角色和重置他人密码。',
    action: ACCESS_ACTIONS.usersManage,
  },
  {
    key: 'roles.manage',
    name: '角色管理',
    description: '新增、搜索、编辑、删除角色，并维护角色权限点。',
    action: ACCESS_ACTIONS.rolesManage,
  },
  {
    key: 'permissions.manage',
    name: '权限点管理',
    description: '新增、搜索、编辑、删除权限点。',
    action: ACCESS_ACTIONS.permissionsManage,
  },
  {
    key: 'menus.manage',
    name: '菜单管理',
    description: '维护后台菜单、页面入口和菜单内按钮授权。',
    action: ACCESS_ACTIONS.menusManage,
  },
  {
    key: 'recipes.manage',
    name: '菜谱管理',
    description: '新增、编辑、删除、停用菜谱和分类。',
    action: ACCESS_ACTIONS.recipesManage,
  },
  {
    key: 'tags.manage',
    name: '标签管理',
    description: '新增、搜索、编辑、删除菜谱标签。',
    action: ACCESS_ACTIONS.tagsManage,
  },
  {
    key: 'uploads.manage',
    name: '上传管理',
    description: '上传菜谱图片等服务端资源。',
    action: ACCESS_ACTIONS.uploadsManage,
  },
  {
    key: 'meals.complete',
    name: '结单管理',
    description: '完成本次点餐并锁定场次。',
    action: ACCESS_ACTIONS.mealsComplete,
  },
] as const;

const chefPermissionKeys = new Set(['recipes.manage', 'tags.manage', 'uploads.manage', 'meals.complete']);

const bootstrapMenus = [
  { key: 'dashboard', title: '仪表盘', path: '/', icon: 'HomeOutlined', type: 'page', sortOrder: 10 },
  { key: 'recipes', title: '菜谱中心', icon: 'BookOutlined', type: 'directory', sortOrder: 20 },
  {
    key: 'recipes.categories',
    parentKey: 'recipes',
    title: '分类管理',
    path: '/categories',
    icon: 'AppstoreOutlined',
    type: 'page',
    sortOrder: 21,
  },
  {
    key: 'recipes.dishes',
    parentKey: 'recipes',
    title: '菜谱管理',
    path: '/dishes',
    icon: 'BookOutlined',
    type: 'page',
    sortOrder: 22,
  },
  {
    key: 'recipes.tags',
    parentKey: 'recipes',
    title: '标签管理',
    path: '/tags',
    icon: 'TagsOutlined',
    type: 'page',
    sortOrder: 23,
  },
  { key: 'meals', title: '点菜菜单', path: '/meals', icon: 'ReadOutlined', type: 'page', sortOrder: 30 },
  { key: 'system', title: '系统管理', icon: 'UserOutlined', type: 'directory', sortOrder: 90 },
  {
    key: 'system.users',
    parentKey: 'system',
    title: '用户管理',
    path: '/users',
    icon: 'UserOutlined',
    type: 'page',
    sortOrder: 91,
  },
  {
    key: 'system.roles',
    parentKey: 'system',
    title: '角色管理',
    path: '/roles',
    icon: 'TeamOutlined',
    type: 'page',
    sortOrder: 92,
  },
  {
    key: 'system.permissions',
    parentKey: 'system',
    title: '权限点管理',
    path: '/permissions',
    icon: 'SafetyCertificateOutlined',
    type: 'page',
    sortOrder: 93,
  },
  {
    key: 'system.menus',
    parentKey: 'system',
    title: '菜单管理',
    path: '/menus',
    icon: 'MenuOutlined',
    type: 'page',
    sortOrder: 94,
  },
  {
    key: 'system.settings',
    parentKey: 'system',
    title: '系统设置',
    path: '/settings',
    icon: 'SettingOutlined',
    type: 'page',
    sortOrder: 95,
  },
] as const;

const bootstrapMenuButtons = [
  { menuKey: 'recipes.categories', key: 'create', name: '新建分类', sortOrder: 10 },
  { menuKey: 'recipes.categories', key: 'edit', name: '编辑分类', sortOrder: 20 },
  { menuKey: 'recipes.categories', key: 'delete', name: '删除分类', sortOrder: 30 },
  { menuKey: 'recipes.dishes', key: 'create', name: '新建菜谱', sortOrder: 10 },
  { menuKey: 'recipes.dishes', key: 'edit', name: '编辑菜谱', sortOrder: 20 },
  { menuKey: 'recipes.dishes', key: 'toggle-active', name: '启停菜谱', sortOrder: 30 },
  { menuKey: 'recipes.dishes', key: 'delete', name: '删除菜谱', sortOrder: 40 },
  { menuKey: 'recipes.tags', key: 'create', name: '新建标签', sortOrder: 10 },
  { menuKey: 'recipes.tags', key: 'edit', name: '编辑标签', sortOrder: 20 },
  { menuKey: 'recipes.tags', key: 'delete', name: '删除标签', sortOrder: 30 },
  { menuKey: 'meals', key: 'complete', name: '完成点菜', sortOrder: 10 },
  { menuKey: 'system.users', key: 'create', name: '新建用户', sortOrder: 10 },
  { menuKey: 'system.users', key: 'edit-roles', name: '分配角色', sortOrder: 20 },
  { menuKey: 'system.users', key: 'reset-password', name: '重置密码', sortOrder: 30 },
  { menuKey: 'system.users', key: 'delete', name: '删除用户', sortOrder: 40 },
  { menuKey: 'system.roles', key: 'create', name: '新建角色', sortOrder: 10 },
  { menuKey: 'system.roles', key: 'edit', name: '编辑角色', sortOrder: 20 },
  { menuKey: 'system.roles', key: 'authorize', name: '授权角色', sortOrder: 30 },
  { menuKey: 'system.roles', key: 'delete', name: '删除角色', sortOrder: 40 },
  { menuKey: 'system.permissions', key: 'create', name: '新建权限点', sortOrder: 10 },
  { menuKey: 'system.permissions', key: 'edit', name: '编辑权限点', sortOrder: 20 },
  { menuKey: 'system.permissions', key: 'delete', name: '删除权限点', sortOrder: 30 },
  { menuKey: 'system.menus', key: 'create', name: '新建菜单', sortOrder: 10 },
  { menuKey: 'system.menus', key: 'edit', name: '编辑菜单', sortOrder: 20 },
  { menuKey: 'system.menus', key: 'delete', name: '删除菜单', sortOrder: 30 },
  { menuKey: 'system.menus', key: 'buttons', name: '维护按钮', sortOrder: 40 },
] as const;

const chefMenuKeys = new Set([
  'dashboard',
  'recipes',
  'recipes.categories',
  'recipes.dishes',
  'recipes.tags',
  'meals',
  'system',
  'system.settings',
]);

const chefButtonKeys = new Set([
  'recipes.categories.create',
  'recipes.categories.edit',
  'recipes.categories.delete',
  'recipes.dishes.create',
  'recipes.dishes.edit',
  'recipes.dishes.toggle-active',
  'recipes.dishes.delete',
  'recipes.tags.create',
  'recipes.tags.edit',
  'recipes.tags.delete',
  'meals.complete',
]);

async function ensureRole(db: Database, key: string, name: string, description: string): Promise<string> {
  const existing = await db.select().from(roles).where(eq(roles.key, key)).limit(1);
  if (existing[0]) {
    await db
      .update(roles)
      .set({ name, description, isSystem: true, updatedAt: new Date() })
      .where(eq(roles.id, existing[0].id));
    return existing[0].id;
  }
  const [row] = await db.insert(roles).values({ key, name, description, isSystem: true }).returning();
  if (!row) throw new Error(`创建角色失败：${key}`);
  return row.id;
}

async function ensurePermission(db: Database, key: string, name: string, description: string): Promise<string> {
  const existing = await db.select().from(permissions).where(eq(permissions.key, key)).limit(1);
  if (existing[0]) {
    await db
      .update(permissions)
      .set({ name, description, isSystem: true, updatedAt: new Date() })
      .where(eq(permissions.id, existing[0].id));
    return existing[0].id;
  }
  const [row] = await db.insert(permissions).values({ key, name, description, isSystem: true }).returning();
  if (!row) throw new Error(`创建权限点失败：${key}`);
  return row.id;
}

async function replaceRolePermissions(db: Database, roleId: string, permissionIds: string[]): Promise<void> {
  const uniquePermissionIds = [...new Set(permissionIds)];
  await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
  if (uniquePermissionIds.length > 0) {
    await db
      .insert(rolePermissions)
      .values(uniquePermissionIds.map((permissionId) => ({ roleId, permissionId })))
      .onConflictDoNothing();
  }
}

async function ensureMenu(
  db: Database,
  input: (typeof bootstrapMenus)[number],
  parentId: string | null,
): Promise<string> {
  const existing = await db.select().from(adminMenus).where(eq(adminMenus.key, input.key)).limit(1);
  const values = {
    parentId,
    title: input.title,
    path: 'path' in input ? input.path : null,
    icon: input.icon,
    type: input.type,
    sortOrder: input.sortOrder,
    isVisible: true,
    isSystem: true,
    updatedAt: new Date(),
  };
  if (existing[0]) {
    await db.update(adminMenus).set(values).where(eq(adminMenus.id, existing[0].id));
    return existing[0].id;
  }
  const [row] = await db.insert(adminMenus).values({ key: input.key, ...values }).returning();
  if (!row) throw new Error(`创建菜单失败：${input.key}`);
  return row.id;
}

async function ensureMenuButton(
  db: Database,
  menuId: string,
  input: (typeof bootstrapMenuButtons)[number],
): Promise<string> {
  const existing = await db
    .select()
    .from(adminMenuButtons)
    .where(and(eq(adminMenuButtons.menuId, menuId), eq(adminMenuButtons.key, input.key)))
    .limit(1);
  const values = {
    name: input.name,
    action: `${input.menuKey}.${input.key}`,
    sortOrder: input.sortOrder,
    isSystem: true,
    updatedAt: new Date(),
  };
  if (existing[0]) {
    await db.update(adminMenuButtons).set(values).where(eq(adminMenuButtons.id, existing[0].id));
    return existing[0].id;
  }
  const [row] = await db.insert(adminMenuButtons).values({ menuId, key: input.key, ...values }).returning();
  if (!row) throw new Error(`创建菜单按钮失败：${input.menuKey}.${input.key}`);
  return row.id;
}

async function replaceRoleMenus(db: Database, roleId: string, menuIds: string[]): Promise<void> {
  const uniqueMenuIds = [...new Set(menuIds)];
  await db.delete(roleMenus).where(eq(roleMenus.roleId, roleId));
  if (uniqueMenuIds.length > 0) {
    await db.insert(roleMenus).values(uniqueMenuIds.map((menuId) => ({ roleId, menuId }))).onConflictDoNothing();
  }
}

async function replaceRoleMenuButtons(db: Database, roleId: string, buttonIds: string[]): Promise<void> {
  const uniqueButtonIds = [...new Set(buttonIds)];
  await db.delete(roleMenuButtons).where(eq(roleMenuButtons.roleId, roleId));
  if (uniqueButtonIds.length > 0) {
    await db
      .insert(roleMenuButtons)
      .values(uniqueButtonIds.map((buttonId) => ({ roleId, buttonId })))
      .onConflictDoNothing();
  }
}

async function getAllPermissionIds(db: Database): Promise<string[]> {
  const rows = await db.select({ id: permissions.id }).from(permissions);
  return rows.map((row) => row.id);
}

async function getAllMenuIds(db: Database): Promise<string[]> {
  const rows = await db.select({ id: adminMenus.id }).from(adminMenus);
  return rows.map((row) => row.id);
}

async function getAllMenuButtonIds(db: Database): Promise<string[]> {
  const rows = await db.select({ id: adminMenuButtons.id }).from(adminMenuButtons);
  return rows.map((row) => row.id);
}

/** 幂等创建单个用户：已存在（按用户名）则跳过密码覆盖，补齐角色绑定。 */
async function seedUser(
  db: Database,
  username: string,
  password: string,
  roleKey: string,
  roleId: string,
): Promise<void> {
  const existing = await db.select().from(users).where(eq(users.username, username)).limit(1);
  const userId = existing[0]?.id;
  if (userId) {
    await db.insert(userRoles).values({ userId, roleId }).onConflictDoNothing();
    process.stdout.write(`· 用户 ${username}（${roleKey}）已存在，已确认角色绑定\n`);
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(users).values({ username, passwordHash }).returning();
  if (!user) throw new Error(`创建用户失败：${username}`);
  await db.insert(userRoles).values({ userId: user.id, roleId }).onConflictDoNothing();
  process.stdout.write(`✓ 已创建 ${roleKey}：${username}\n`);
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('缺少环境变量 DATABASE_URL');

  const chefPassword = process.env.SEED_CHEF_PASSWORD;
  const dinerPassword = process.env.SEED_DINER_PASSWORD;
  const superAdminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD;
  if (!superAdminPassword || !chefPassword || !dinerPassword) {
    throw new Error(
      '缺少环境变量 SEED_SUPER_ADMIN_PASSWORD / SEED_CHEF_PASSWORD / SEED_DINER_PASSWORD（初始密码不可硬编码）',
    );
  }
  const superAdminName = process.env.SEED_SUPER_ADMIN_USERNAME ?? 'super_admin';
  const chefName = process.env.SEED_CHEF_USERNAME ?? 'chef';
  const dinerName = process.env.SEED_DINER_USERNAME ?? 'diner';

  const db = createDb(url);
  const superAdminRoleId = await ensureRole(
    db,
    'super_admin',
    '超级管理员',
    '默认最高权限角色，可管理用户、角色、权限点和全部业务数据。',
  );
  const chefRoleId = await ensureRole(
    db,
    'chef',
    '主厨',
    '默认主厨角色，可管理菜谱、上传资源并完成点餐场次。',
  );
  const dinerRoleId = await ensureRole(db, 'diner', '食客', '默认点菜角色，可浏览菜谱并参与点菜。');
  const chefPermissionIds: string[] = [];

  for (const permission of bootstrapPermissions) {
    const permissionId = await ensurePermission(db, permission.key, permission.name, permission.description);
    if (chefPermissionKeys.has(permission.key)) chefPermissionIds.push(permissionId);
    await db.insert(permissionActionBindings).values({ permissionId, action: permission.action }).onConflictDoNothing();
  }
  await replaceRolePermissions(db, superAdminRoleId, await getAllPermissionIds(db));
  await replaceRolePermissions(db, chefRoleId, chefPermissionIds);
  await replaceRolePermissions(db, dinerRoleId, []);

  const menuIdsByKey = new Map<string, string>();
  for (const menu of bootstrapMenus) {
    const parentId = 'parentKey' in menu && menu.parentKey ? menuIdsByKey.get(menu.parentKey) ?? null : null;
    menuIdsByKey.set(menu.key, await ensureMenu(db, menu, parentId));
  }

  const buttonIdsByKey = new Map<string, string>();
  for (const button of bootstrapMenuButtons) {
    const menuId = menuIdsByKey.get(button.menuKey);
    if (!menuId) throw new Error(`菜单按钮缺少所属菜单：${button.menuKey}`);
    buttonIdsByKey.set(`${button.menuKey}.${button.key}`, await ensureMenuButton(db, menuId, button));
  }

  await replaceRoleMenus(db, superAdminRoleId, await getAllMenuIds(db));
  await replaceRoleMenuButtons(db, superAdminRoleId, await getAllMenuButtonIds(db));
  await replaceRoleMenus(
    db,
    chefRoleId,
    [...chefMenuKeys].map((key) => menuIdsByKey.get(key)).filter((id): id is string => Boolean(id)),
  );
  await replaceRoleMenuButtons(
    db,
    chefRoleId,
    [...chefButtonKeys].map((key) => buttonIdsByKey.get(key)).filter((id): id is string => Boolean(id)),
  );
  await replaceRoleMenus(db, dinerRoleId, []);
  await replaceRoleMenuButtons(db, dinerRoleId, []);

  await db.insert(tags).values({ name: '家常菜', sortOrder: 10, isSystem: true }).onConflictDoNothing();
  await db.insert(tags).values({ name: '快手菜', sortOrder: 20, isSystem: true }).onConflictDoNothing();
  await db.insert(tags).values({ name: '想吃', sortOrder: 30, isSystem: true }).onConflictDoNothing();

  await seedUser(db, superAdminName, superAdminPassword, 'super_admin', superAdminRoleId);
  await seedUser(db, chefName, chefPassword, 'chef', chefRoleId);
  await seedUser(db, dinerName, dinerPassword, 'diner', dinerRoleId);
  process.stdout.write('种子数据完成\n');
  process.exit(0);
}

main().catch((err: unknown) => {
  process.stderr.write(`种子失败：${String(err)}\n`);
  process.exit(1);
});
