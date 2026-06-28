import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, eq, ilike, inArray, or } from 'drizzle-orm';
import {
  adminMenuButtons,
  adminMenus,
  roleMenuButtons,
  roleMenus,
  roles,
  userRoles,
  type AdminMenuButtonRow,
  type AdminMenuRow,
  type RoleRow,
} from '@feed-plan/db';
import type {
  AccessListQuery,
  AdminMenu,
  AuthMenu,
  CreateMenuButtonInput,
  CreateMenuInput,
  CreateRoleInput,
  MenuButton,
  MenuSummary,
  Role,
  RoleMenuAccess,
  RoleSummary,
  UpdateMenuButtonInput,
  UpdateMenuInput,
  UpdateRoleInput,
  UpdateRoleMenusInput,
} from '@feed-plan/shared';
import { isUniqueViolation } from '../common/db-errors.js';
import { DRIZZLE, type DrizzleDb } from '../drizzle/drizzle.constants.js';
import { MANAGEMENT_ACTIONS, type AccessAction } from './access-actions.js';

const SUPER_ADMIN_ROLE_KEY = 'super_admin';

function toRoleSummary(row: RoleRow): RoleSummary {
  return { id: row.id, key: row.key, name: row.name, description: row.description };
}

function toMenuSummary(row: AdminMenuRow): MenuSummary {
  return {
    id: row.id,
    parentId: row.parentId,
    key: row.key,
    title: row.title,
    path: row.path,
    icon: row.icon,
    type: row.type,
    componentKey: row.componentKey,
    externalUrl: row.externalUrl,
    openInNewTab: row.openInNewTab,
    layoutKey: row.layoutKey,
    isCache: row.isCache,
    isTabVisible: row.isTabVisible,
    isAffix: row.isAffix,
    activeMenuKey: row.activeMenuKey,
    sortOrder: row.sortOrder,
    isVisible: row.isVisible,
    isSystem: row.isSystem,
  };
}

function toMenuButton(row: AdminMenuButtonRow): MenuButton {
  return {
    id: row.id,
    menuId: row.menuId,
    key: row.key,
    name: row.name,
    action: row.action,
    sortOrder: row.sortOrder,
    isSystem: row.isSystem,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

@Injectable()
export class AccessService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async listRoles(query: AccessListQuery = {}): Promise<Role[]> {
    const rows = await this.db
      .select()
      .from(roles)
      .where(this.buildKeywordWhere(query.keyword, roles.name, roles.key))
      .orderBy(asc(roles.createdAt), asc(roles.name));
    const accessMap = await this.getRoleAccessByRoleIds(rows.map((role) => role.id));
    return rows.map((row): Role => ({
      ...toRoleSummary(row),
      isSystem: row.isSystem,
      menuIds: accessMap.get(row.id)?.menuIds ?? [],
      buttonIds: accessMap.get(row.id)?.buttonIds ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  async listMenus(query: AccessListQuery = {}): Promise<AdminMenu[]> {
    const rows = await this.db
      .select()
      .from(adminMenus)
      .where(
        query.keyword
          ? or(ilike(adminMenus.title, `%${query.keyword}%`), ilike(adminMenus.key, `%${query.keyword}%`))
          : undefined,
      )
      .orderBy(asc(adminMenus.sortOrder), asc(adminMenus.createdAt));
    const buttons = await this.getButtonsByMenuIds(rows.map((menu) => menu.id));
    return rows.map((row) => ({
      ...toMenuSummary(row),
      buttons: buttons.get(row.id) ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  async createMenu(input: CreateMenuInput): Promise<AdminMenu> {
    if (input.parentId) await this.assertMenuExists(input.parentId);
    try {
      const [row] = await this.db
        .insert(adminMenus)
        .values({
          parentId: input.parentId ?? null,
          key: input.key,
          title: input.title,
          path: input.path ?? null,
          icon: input.icon ?? null,
          type: input.type,
          componentKey: input.componentKey ?? null,
          externalUrl: input.externalUrl ?? null,
          openInNewTab: input.openInNewTab,
          layoutKey: input.layoutKey,
          isCache: input.isCache,
          isTabVisible: input.isTabVisible,
          isAffix: input.isAffix,
          activeMenuKey: input.activeMenuKey ?? null,
          sortOrder: input.sortOrder,
          isVisible: input.isVisible,
        })
        .returning();
      if (!row) throw new BadRequestException('菜单创建失败');
      await this.grantMenuToSuperAdmin(row.id);
      return (await this.getMenu(row.id))!;
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException('菜单标识已存在');
      throw error;
    }
  }

  async updateMenu(id: string, input: UpdateMenuInput): Promise<AdminMenu> {
    await this.assertMenuExists(id);
    if (input.parentId) await this.assertMenuExists(input.parentId);
    if (input.parentId === id) throw new BadRequestException('上级菜单不能选择自己');
    try {
      await this.db
        .update(adminMenus)
        .set({
          ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
          ...(input.key !== undefined ? { key: input.key } : {}),
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.path !== undefined ? { path: input.path } : {}),
          ...(input.icon !== undefined ? { icon: input.icon } : {}),
          ...(input.type !== undefined ? { type: input.type } : {}),
          ...(input.componentKey !== undefined ? { componentKey: input.componentKey } : {}),
          ...(input.externalUrl !== undefined ? { externalUrl: input.externalUrl } : {}),
          ...(input.openInNewTab !== undefined ? { openInNewTab: input.openInNewTab } : {}),
          ...(input.layoutKey !== undefined ? { layoutKey: input.layoutKey } : {}),
          ...(input.isCache !== undefined ? { isCache: input.isCache } : {}),
          ...(input.isTabVisible !== undefined ? { isTabVisible: input.isTabVisible } : {}),
          ...(input.isAffix !== undefined ? { isAffix: input.isAffix } : {}),
          ...(input.activeMenuKey !== undefined ? { activeMenuKey: input.activeMenuKey } : {}),
          ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
          ...(input.isVisible !== undefined ? { isVisible: input.isVisible } : {}),
          updatedAt: new Date(),
        })
        .where(eq(adminMenus.id, id));
      return (await this.getMenu(id))!;
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException('菜单标识已存在');
      throw error;
    }
  }

  async removeMenu(id: string): Promise<void> {
    await this.assertMenuExists(id);
    const childRows = await this.db
      .select({ id: adminMenus.id })
      .from(adminMenus)
      .where(eq(adminMenus.parentId, id))
      .limit(1);
    if (childRows[0]) throw new ConflictException('该菜单存在子菜单，不能删除');
    await this.db.delete(adminMenus).where(eq(adminMenus.id, id));
  }

  async createMenuButton(input: CreateMenuButtonInput): Promise<MenuButton> {
    await this.assertMenuExists(input.menuId);
    try {
      const [row] = await this.db
        .insert(adminMenuButtons)
        .values(input)
        .returning();
      if (!row) throw new BadRequestException('按钮创建失败');
      await this.grantMenuButtonToSuperAdmin(row.id);
      return toMenuButton(row);
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException('按钮标识已存在');
      throw error;
    }
  }

  async updateMenuButton(id: string, input: UpdateMenuButtonInput): Promise<MenuButton> {
    await this.assertMenuButtonExists(id);
    try {
      const [row] = await this.db
        .update(adminMenuButtons)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(adminMenuButtons.id, id))
        .returning();
      if (!row) throw new NotFoundException('按钮不存在');
      return toMenuButton(row);
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException('按钮标识已存在');
      throw error;
    }
  }

  async removeMenuButton(id: string): Promise<void> {
    await this.assertMenuButtonExists(id);
    await this.db.delete(adminMenuButtons).where(eq(adminMenuButtons.id, id));
  }

  async getRoleMenuAccess(roleId: string): Promise<RoleMenuAccess> {
    await this.assertRoleExists(roleId);
    const menuRows = await this.db.select({ menuId: roleMenus.menuId }).from(roleMenus).where(eq(roleMenus.roleId, roleId));
    const buttonRows = await this.db
      .select({ buttonId: roleMenuButtons.buttonId })
      .from(roleMenuButtons)
      .where(eq(roleMenuButtons.roleId, roleId));
    return {
      menuIds: menuRows.map((row) => row.menuId),
      buttonIds: buttonRows.map((row) => row.buttonId),
    };
  }

  async replaceRoleMenuAccess(roleId: string, input: UpdateRoleMenusInput): Promise<void> {
    await this.assertRoleExists(roleId);
    await this.assertMenusExist(input.menuIds);
    await this.assertMenuButtonsExist(input.buttonIds);
    await this.db.delete(roleMenus).where(eq(roleMenus.roleId, roleId));
    await this.db.delete(roleMenuButtons).where(eq(roleMenuButtons.roleId, roleId));
    if (input.menuIds.length > 0) {
      await this.db.insert(roleMenus).values([...new Set(input.menuIds)].map((menuId) => ({ roleId, menuId })));
    }
    if (input.buttonIds.length > 0) {
      await this.db.insert(roleMenuButtons).values([...new Set(input.buttonIds)].map((buttonId) => ({ roleId, buttonId })));
    }
  }

  async createRole(input: CreateRoleInput): Promise<Role> {
    await this.assertMenusExist(input.menuIds);
    await this.assertMenuButtonsExist(input.buttonIds);
    try {
      const [row] = await this.db
        .insert(roles)
        .values({
          key: input.key,
          name: input.name,
          description: input.description ?? null,
        })
        .returning();
      if (!row) throw new BadRequestException('角色创建失败');
      await this.replaceRoleMenuAccess(row.id, { menuIds: input.menuIds, buttonIds: input.buttonIds });
      return (await this.getRole(row.id))!;
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException('角色标识已存在');
      throw error;
    }
  }

  async updateRole(id: string, input: UpdateRoleInput): Promise<Role> {
    await this.assertRoleExists(id);
    if (input.menuIds) await this.assertMenusExist(input.menuIds);
    if (input.buttonIds) await this.assertMenuButtonsExist(input.buttonIds);

    try {
      if (input.key !== undefined || input.name !== undefined || input.description !== undefined) {
        await this.db
          .update(roles)
          .set({
            ...(input.key !== undefined ? { key: input.key } : {}),
            ...(input.name !== undefined ? { name: input.name } : {}),
            ...(input.description !== undefined ? { description: input.description ?? null } : {}),
            updatedAt: new Date(),
          })
          .where(eq(roles.id, id));
      }
      if (input.menuIds || input.buttonIds) {
        const current = await this.getRoleMenuAccess(id);
        await this.replaceRoleMenuAccess(id, {
          menuIds: input.menuIds ?? current.menuIds,
          buttonIds: input.buttonIds ?? current.buttonIds,
        });
      }
      return (await this.getRole(id))!;
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException('角色标识已存在');
      throw error;
    }
  }

  async removeRole(id: string): Promise<void> {
    await this.assertRoleExists(id);
    const usersWithRole = await this.db
      .select({ userId: userRoles.userId })
      .from(userRoles)
      .where(eq(userRoles.roleId, id))
      .limit(1);
    if (usersWithRole[0]) {
      throw new ConflictException('该角色仍被用户使用，不能删除');
    }
    await this.db.delete(roles).where(eq(roles.id, id));
  }

  async roleIdsGrantAnyAction(roleIds: string[], actions: readonly AccessAction[]): Promise<boolean> {
    if (roleIds.length === 0 || actions.length === 0) return false;
    const rows = await this.db
      .select({ action: adminMenuButtons.action })
      .from(roleMenuButtons)
      .innerJoin(adminMenuButtons, eq(roleMenuButtons.buttonId, adminMenuButtons.id))
      .where(
        and(
          inArray(roleMenuButtons.roleId, roleIds),
          inArray(adminMenuButtons.action, [...actions]),
        ),
      )
      .limit(1);
    return Boolean(rows[0]);
  }

  async roleIdsKeepManagementAccess(roleIds: string[]): Promise<boolean> {
    return this.roleIdsGrantAnyAction(roleIds, MANAGEMENT_ACTIONS);
  }

  async getUserRoles(userId: string): Promise<RoleSummary[]> {
    const rows = await this.db
      .select({ role: roles })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId))
      .orderBy(asc(roles.name));
    return rows.map((row) => toRoleSummary(row.role));
  }

  async getUserActions(userId: string): Promise<string[]> {
    const rows = await this.db
      .select({ action: adminMenuButtons.action })
      .from(userRoles)
      .innerJoin(roleMenuButtons, eq(userRoles.roleId, roleMenuButtons.roleId))
      .innerJoin(adminMenuButtons, eq(roleMenuButtons.buttonId, adminMenuButtons.id))
      .where(eq(userRoles.userId, userId))
      .orderBy(asc(adminMenuButtons.action));
    return [...new Set(rows.map((row) => row.action))];
  }

  async getUserMenuKeys(userId: string): Promise<string[]> {
    const rows = await this.db
      .select({ key: adminMenus.key })
      .from(userRoles)
      .innerJoin(roleMenus, eq(userRoles.roleId, roleMenus.roleId))
      .innerJoin(adminMenus, eq(roleMenus.menuId, adminMenus.id))
      .where(eq(userRoles.userId, userId))
      .orderBy(asc(adminMenus.key));
    return [...new Set(rows.map((row) => row.key))];
  }

  async getUserButtonKeys(userId: string): Promise<string[]> {
    const rows = await this.db
      .select({ menuKey: adminMenus.key, buttonKey: adminMenuButtons.key })
      .from(userRoles)
      .innerJoin(roleMenuButtons, eq(userRoles.roleId, roleMenuButtons.roleId))
      .innerJoin(adminMenuButtons, eq(roleMenuButtons.buttonId, adminMenuButtons.id))
      .innerJoin(adminMenus, eq(adminMenuButtons.menuId, adminMenus.id))
      .where(eq(userRoles.userId, userId))
      .orderBy(asc(adminMenus.key), asc(adminMenuButtons.key));
    return [...new Set(rows.map((row) => `${row.menuKey}.${row.buttonKey}`))];
  }

  async getUserMenus(userId: string): Promise<AuthMenu[]> {
    const menuRows = await this.db
      .select({ menu: adminMenus })
      .from(userRoles)
      .innerJoin(roleMenus, eq(userRoles.roleId, roleMenus.roleId))
      .innerJoin(adminMenus, eq(roleMenus.menuId, adminMenus.id))
      .where(eq(userRoles.userId, userId))
      .orderBy(asc(adminMenus.sortOrder), asc(adminMenus.createdAt));
    const uniqueMenus = [...new Map(menuRows.map((row) => [row.menu.id, row.menu])).values()].filter(
      (menu) => menu.isVisible,
    );

    const buttonRows = await this.db
      .select({ button: adminMenuButtons })
      .from(userRoles)
      .innerJoin(roleMenuButtons, eq(userRoles.roleId, roleMenuButtons.roleId))
      .innerJoin(adminMenuButtons, eq(roleMenuButtons.buttonId, adminMenuButtons.id))
      .innerJoin(adminMenus, eq(adminMenuButtons.menuId, adminMenus.id))
      .where(eq(userRoles.userId, userId))
      .orderBy(asc(adminMenuButtons.sortOrder), asc(adminMenuButtons.createdAt));
    const buttonsByMenuId = new Map<string, MenuButton[]>();
    for (const row of buttonRows) {
      const list = buttonsByMenuId.get(row.button.menuId) ?? [];
      if (!list.some((button) => button.id === row.button.id)) {
        list.push(toMenuButton(row.button));
      }
      buttonsByMenuId.set(row.button.menuId, list);
    }

    const nodes = new Map<string, AuthMenu>();
    for (const menu of uniqueMenus) {
      nodes.set(menu.id, {
        ...toMenuSummary(menu),
        buttons: buttonsByMenuId.get(menu.id) ?? [],
        children: [],
      });
    }

    const roots: AuthMenu[] = [];
    for (const menu of uniqueMenus) {
      const node = nodes.get(menu.id);
      if (!node) continue;
      const parent = menu.parentId ? nodes.get(menu.parentId) : undefined;
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
    const sortTree = (items: AuthMenu[]) => {
      items.sort((a, b) => a.sortOrder - b.sortOrder);
      for (const item of items) sortTree(item.children);
      return items;
    };
    return sortTree(roots);
  }

  async assertRolesExist(roleIds: string[]): Promise<void> {
    const uniqueRoleIds = [...new Set(roleIds)];
    if (uniqueRoleIds.length === 0) return;
    const rows = await this.db.select({ id: roles.id }).from(roles).where(inArray(roles.id, uniqueRoleIds));
    if (rows.length !== uniqueRoleIds.length) {
      throw new BadRequestException('角色不存在');
    }
  }

  private async getRole(id: string): Promise<Role | null> {
    const rows = await this.db.select().from(roles).where(eq(roles.id, id)).limit(1);
    const row = rows[0];
    if (!row) return null;
    const access = await this.getRoleMenuAccess(id);
    return {
      ...toRoleSummary(row),
      isSystem: row.isSystem,
      menuIds: access.menuIds,
      buttonIds: access.buttonIds,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private async getMenu(id: string): Promise<AdminMenu | null> {
    const rows = await this.db.select().from(adminMenus).where(eq(adminMenus.id, id)).limit(1);
    const row = rows[0];
    if (!row) return null;
    const buttons = await this.getButtonsByMenuIds([id]);
    return {
      ...toMenuSummary(row),
      buttons: buttons.get(id) ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private async getRoleAccessByRoleIds(roleIds: string[]): Promise<Map<string, RoleMenuAccess>> {
    const map = new Map<string, RoleMenuAccess>();
    if (roleIds.length === 0) return map;
    const menuRows = await this.db
      .select({ roleId: roleMenus.roleId, menuId: roleMenus.menuId })
      .from(roleMenus)
      .where(inArray(roleMenus.roleId, roleIds));
    for (const row of menuRows) {
      const access = map.get(row.roleId) ?? { menuIds: [], buttonIds: [] };
      access.menuIds.push(row.menuId);
      map.set(row.roleId, access);
    }
    const buttonRows = await this.db
      .select({ roleId: roleMenuButtons.roleId, buttonId: roleMenuButtons.buttonId })
      .from(roleMenuButtons)
      .where(inArray(roleMenuButtons.roleId, roleIds));
    for (const row of buttonRows) {
      const access = map.get(row.roleId) ?? { menuIds: [], buttonIds: [] };
      access.buttonIds.push(row.buttonId);
      map.set(row.roleId, access);
    }
    return map;
  }

  private async getButtonsByMenuIds(menuIds: string[]): Promise<Map<string, MenuButton[]>> {
    if (menuIds.length === 0) return new Map();
    const rows = await this.db
      .select()
      .from(adminMenuButtons)
      .where(inArray(adminMenuButtons.menuId, menuIds))
      .orderBy(asc(adminMenuButtons.sortOrder), asc(adminMenuButtons.createdAt));
    const map = new Map<string, MenuButton[]>();
    for (const row of rows) {
      const list = map.get(row.menuId) ?? [];
      list.push(toMenuButton(row));
      map.set(row.menuId, list);
    }
    return map;
  }

  private async assertRoleExists(id: string): Promise<void> {
    const rows = await this.db.select({ id: roles.id }).from(roles).where(eq(roles.id, id)).limit(1);
    if (!rows[0]) throw new NotFoundException('角色不存在');
  }

  private async assertMenuExists(id: string): Promise<void> {
    const rows = await this.db.select({ id: adminMenus.id }).from(adminMenus).where(eq(adminMenus.id, id)).limit(1);
    if (!rows[0]) throw new NotFoundException('菜单不存在');
  }

  private async assertMenuButtonExists(id: string): Promise<void> {
    const rows = await this.db
      .select({ id: adminMenuButtons.id })
      .from(adminMenuButtons)
      .where(eq(adminMenuButtons.id, id))
      .limit(1);
    if (!rows[0]) throw new NotFoundException('按钮不存在');
  }

  private async getSuperAdminRoleId(): Promise<string | null> {
    const rows = await this.db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.key, SUPER_ADMIN_ROLE_KEY))
      .limit(1);
    return rows[0]?.id ?? null;
  }

  private async grantMenuToSuperAdmin(menuId: string): Promise<void> {
    const roleId = await this.getSuperAdminRoleId();
    if (!roleId) return;
    await this.db.insert(roleMenus).values({ roleId, menuId }).onConflictDoNothing();
  }

  private async grantMenuButtonToSuperAdmin(buttonId: string): Promise<void> {
    const roleId = await this.getSuperAdminRoleId();
    if (!roleId) return;
    await this.db.insert(roleMenuButtons).values({ roleId, buttonId }).onConflictDoNothing();
  }

  private async assertMenusExist(menuIds: string[]): Promise<void> {
    const uniqueMenuIds = [...new Set(menuIds)];
    if (uniqueMenuIds.length === 0) return;
    const rows = await this.db.select({ id: adminMenus.id }).from(adminMenus).where(inArray(adminMenus.id, uniqueMenuIds));
    if (rows.length !== uniqueMenuIds.length) throw new BadRequestException('菜单不存在');
  }

  private async assertMenuButtonsExist(buttonIds: string[]): Promise<void> {
    const uniqueButtonIds = [...new Set(buttonIds)];
    if (uniqueButtonIds.length === 0) return;
    const rows = await this.db
      .select({ id: adminMenuButtons.id })
      .from(adminMenuButtons)
      .where(inArray(adminMenuButtons.id, uniqueButtonIds));
    if (rows.length !== uniqueButtonIds.length) throw new BadRequestException('按钮不存在');
  }

  private buildKeywordWhere(keyword: string | undefined, nameColumn: typeof roles.name, keyColumn: typeof roles.key) {
    if (!keyword) return undefined;
    const pattern = `%${keyword}%`;
    return or(ilike(nameColumn, pattern), ilike(keyColumn, pattern));
  }
}
