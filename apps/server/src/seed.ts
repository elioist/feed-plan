import bcrypt from 'bcrypt';
import { and, eq } from 'drizzle-orm';
import {
  adminMenuButtons,
  adminMenus,
  createDb,
  roleMenuButtons,
  roleMenus,
  roles,
  tags,
  userRoles,
  users,
  type Database,
} from '@feed-plan/db';
import { ACCESS_ACTIONS } from './auth/access-actions.js';

const bootstrapMenus = [
  { key: 'dashboard', title: '仪表盘', path: '/', icon: 'lucide:layout-dashboard', type: 'page', componentKey: 'dashboard', sortOrder: 10, isAffix: true },
  { key: 'recipes', title: '菜谱中心', icon: 'lucide:book-open', type: 'directory', sortOrder: 20 },
  {
    key: 'recipes.categories',
    parentKey: 'recipes',
    title: '分类管理',
    path: '/categories',
    icon: 'lucide:layout-grid',
    type: 'page',
    componentKey: 'recipes.categories',
    sortOrder: 21,
  },
  {
    key: 'recipes.dishes',
    parentKey: 'recipes',
    title: '菜谱管理',
    path: '/dishes',
    icon: 'lucide:cooking-pot',
    type: 'page',
    componentKey: 'recipes.dishes',
    isCache: true,
    sortOrder: 22,
  },
  {
    key: 'recipes.tags',
    parentKey: 'recipes',
    title: '标签管理',
    path: '/tags',
    icon: 'lucide:tags',
    type: 'page',
    componentKey: 'recipes.tags',
    sortOrder: 23,
  },
  { key: 'meals', title: '点菜菜单', path: '/meals', icon: 'lucide:utensils', type: 'page', componentKey: 'meals', sortOrder: 30 },
  { key: 'system', title: '系统管理', icon: 'lucide:settings', type: 'directory', sortOrder: 90 },
  {
    key: 'system.users',
    parentKey: 'system',
    title: '用户管理',
    path: '/users',
    icon: 'lucide:users',
    type: 'page',
    componentKey: 'system.users',
    sortOrder: 91,
  },
  {
    key: 'system.roles',
    parentKey: 'system',
    title: '角色管理',
    path: '/roles',
    icon: 'lucide:shield-check',
    type: 'page',
    componentKey: 'system.roles',
    sortOrder: 92,
  },
  {
    key: 'system.menus',
    parentKey: 'system',
    title: '菜单管理',
    path: '/menus',
    icon: 'lucide:menu',
    type: 'page',
    componentKey: 'system.menus',
    sortOrder: 93,
  },
  {
    key: 'system.settings',
    parentKey: 'system',
    title: '系统设置',
    path: '/settings',
    icon: 'lucide:settings',
    type: 'page',
    componentKey: 'system.settings',
    sortOrder: 94,
  },
] as const;

const bootstrapMenuButtons = [
  { menuKey: 'recipes.dishes', key: 'manage', name: '菜谱接口管理', action: ACCESS_ACTIONS.recipesManage, sortOrder: 1 },
  { menuKey: 'recipes.dishes', key: 'upload', name: '上传菜谱图片', action: ACCESS_ACTIONS.uploadsManage, sortOrder: 2 },
  { menuKey: 'recipes.categories', key: 'create', name: '新建分类', sortOrder: 10 },
  { menuKey: 'recipes.categories', key: 'edit', name: '编辑分类', sortOrder: 20 },
  { menuKey: 'recipes.categories', key: 'delete', name: '删除分类', sortOrder: 30 },
  { menuKey: 'recipes.dishes', key: 'create', name: '新建菜谱', sortOrder: 10 },
  { menuKey: 'recipes.dishes', key: 'edit', name: '编辑菜谱', sortOrder: 20 },
  { menuKey: 'recipes.dishes', key: 'toggle-active', name: '启停菜谱', sortOrder: 30 },
  { menuKey: 'recipes.dishes', key: 'delete', name: '删除菜谱', sortOrder: 40 },
  { menuKey: 'recipes.tags', key: 'manage', name: '标签接口管理', action: ACCESS_ACTIONS.tagsManage, sortOrder: 1 },
  { menuKey: 'recipes.tags', key: 'create', name: '新建标签', sortOrder: 10 },
  { menuKey: 'recipes.tags', key: 'edit', name: '编辑标签', sortOrder: 20 },
  { menuKey: 'recipes.tags', key: 'delete', name: '删除标签', sortOrder: 30 },
  { menuKey: 'meals', key: 'complete', name: '完成点菜', sortOrder: 10 },
  { menuKey: 'system.users', key: 'manage', name: '用户接口管理', action: ACCESS_ACTIONS.usersManage, sortOrder: 1 },
  { menuKey: 'system.users', key: 'create', name: '新建用户', sortOrder: 10 },
  { menuKey: 'system.users', key: 'edit-roles', name: '分配角色', sortOrder: 20 },
  { menuKey: 'system.users', key: 'reset-password', name: '重置密码', sortOrder: 30 },
  { menuKey: 'system.users', key: 'delete', name: '删除用户', sortOrder: 40 },
  { menuKey: 'system.roles', key: 'manage', name: '角色接口管理', action: ACCESS_ACTIONS.rolesManage, sortOrder: 1 },
  { menuKey: 'system.roles', key: 'create', name: '新建角色', sortOrder: 10 },
  { menuKey: 'system.roles', key: 'edit', name: '编辑角色', sortOrder: 20 },
  { menuKey: 'system.roles', key: 'authorize', name: '授权角色', sortOrder: 30 },
  { menuKey: 'system.roles', key: 'delete', name: '删除角色', sortOrder: 40 },
  { menuKey: 'system.menus', key: 'manage', name: '菜单接口管理', action: ACCESS_ACTIONS.menusManage, sortOrder: 1 },
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
  'recipes.dishes.manage',
  'recipes.dishes.upload',
  'recipes.categories.create',
  'recipes.categories.edit',
  'recipes.categories.delete',
  'recipes.dishes.create',
  'recipes.dishes.edit',
  'recipes.dishes.toggle-active',
  'recipes.dishes.delete',
  'recipes.tags.manage',
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
    componentKey: 'componentKey' in input ? input.componentKey : null,
    externalUrl: null,
    openInNewTab: false,
    layoutKey: 'admin' as const,
    isCache: 'isCache' in input ? input.isCache : false,
    isTabVisible: true,
    isAffix: 'isAffix' in input ? input.isAffix : false,
    activeMenuKey: null,
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
    action: 'action' in input ? input.action : `${input.menuKey}.${input.key}`,
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
    '默认最高权限角色，可管理用户、角色、菜单和全部业务数据。',
  );
  const chefRoleId = await ensureRole(
    db,
    'chef',
    '主厨',
    '默认主厨角色，可管理菜谱、上传资源并完成点餐场次。',
  );
  const dinerRoleId = await ensureRole(db, 'diner', '食客', '默认点菜角色，可浏览菜谱并参与点菜。');

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
