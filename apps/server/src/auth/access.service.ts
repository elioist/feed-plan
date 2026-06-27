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
  permissionActionBindings,
  permissions,
  roleMenuButtons,
  roleMenus,
  rolePermissions,
  roles,
  userRoles,
  type AdminMenuButtonRow,
  type AdminMenuRow,
  type PermissionRow,
  type RoleRow,
} from '@feed-plan/db';
import type {
  AccessListQuery,
  AdminMenu,
  CreateMenuButtonInput,
  CreateMenuInput,
  CreatePermissionInput,
  CreateRoleInput,
  MenuButton,
  MenuSummary,
  Permission,
  PermissionSummary,
  Role,
  RoleMenuAccess,
  RoleSummary,
  UpdateMenuButtonInput,
  UpdateMenuInput,
  UpdatePermissionInput,
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

function toPermissionSummary(row: PermissionRow): PermissionSummary {
  return { id: row.id, key: row.key, name: row.name, description: row.description };
}

function toPermission(row: PermissionRow): Permission {
  return { ...toPermissionSummary(row), isSystem: row.isSystem, createdAt: row.createdAt, updatedAt: row.updatedAt };
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
    const permissionMap = await this.getPermissionsByRoleIds(rows.map((role) => role.id));
    return rows.map((row) => ({
      ...toRoleSummary(row),
      isSystem: row.isSystem,
      permissions: permissionMap.get(row.id) ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  async listPermissions(query: AccessListQuery = {}): Promise<Permission[]> {
    const rows = await this.db
      .select()
      .from(permissions)
      .where(
        query.keyword
          ? or(ilike(permissions.name, `%${query.keyword}%`), ilike(permissions.key, `%${query.keyword}%`))
          : undefined,
      )
      .orderBy(asc(permissions.createdAt), asc(permissions.name));
    return rows.map(toPermission);
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
    await this.assertPermissionsExist(input.permissionIds);
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
      await this.replaceRolePermissions(row.id, input.permissionIds);
      return (await this.getRole(row.id))!;
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException('角色标识已存在');
      throw error;
    }
  }

  async updateRole(id: string, input: UpdateRoleInput): Promise<Role> {
    await this.assertRoleExists(id);
    if (input.permissionIds) await this.assertPermissionsExist(input.permissionIds);

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
      if (input.permissionIds) await this.replaceRolePermissions(id, input.permissionIds);
      return (await this.getRole(id))!;
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException('角色标识已存在');
      throw error;
    }
  }

  async replaceRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await this.assertRoleExists(roleId);
    await this.assertPermissionsExist(permissionIds);
    await this.db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    if (permissionIds.length > 0) {
      await this.db
        .insert(rolePermissions)
        .values([...new Set(permissionIds)].map((permissionId) => ({ roleId, permissionId })));
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

  async createPermission(input: CreatePermissionInput): Promise<Permission> {
    try {
      const [row] = await this.db
        .insert(permissions)
        .values({ key: input.key, name: input.name, description: input.description ?? null })
        .returning();
      if (!row) throw new BadRequestException('权限点创建失败');
      await this.grantPermissionToSuperAdmin(row.id);
      return toPermission(row);
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException('权限点标识已存在');
      throw error;
    }
  }

  async updatePermission(id: string, input: UpdatePermissionInput): Promise<Permission> {
    await this.assertPermissionExists(id);
    try {
      const [row] = await this.db
        .update(permissions)
        .set({
          ...(input.key !== undefined ? { key: input.key } : {}),
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.description !== undefined ? { description: input.description ?? null } : {}),
          updatedAt: new Date(),
        })
        .where(eq(permissions.id, id))
        .returning();
      if (!row) throw new NotFoundException('权限点不存在');
      return toPermission(row);
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException('权限点标识已存在');
      throw error;
    }
  }

  async removePermission(id: string): Promise<void> {
    await this.assertPermissionExists(id);
    const usedByRole = await this.db
      .select({ roleId: rolePermissions.roleId })
      .from(rolePermissions)
      .where(eq(rolePermissions.permissionId, id))
      .limit(1);
    if (usedByRole[0]) {
      throw new ConflictException('该权限点仍被角色使用，不能删除');
    }
    await this.db.delete(permissions).where(eq(permissions.id, id));
  }

  async roleIdsGrantAnyAction(roleIds: string[], actions: readonly AccessAction[]): Promise<boolean> {
    if (roleIds.length === 0 || actions.length === 0) return false;
    const rows = await this.db
      .select({ action: permissionActionBindings.action })
      .from(rolePermissions)
      .innerJoin(
        permissionActionBindings,
        eq(rolePermissions.permissionId, permissionActionBindings.permissionId),
      )
      .where(
        and(
          inArray(rolePermissions.roleId, roleIds),
          inArray(permissionActionBindings.action, [...actions]),
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

  async getUserPermissions(userId: string): Promise<PermissionSummary[]> {
    const rows = await this.db
      .select({ permission: permissions })
      .from(userRoles)
      .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(userRoles.userId, userId))
      .orderBy(asc(permissions.name));
    return [...new Map(rows.map((row) => [row.permission.id, toPermissionSummary(row.permission)])).values()];
  }

  async getUserActions(userId: string): Promise<string[]> {
    const rows = await this.db
      .select({ action: permissionActionBindings.action })
      .from(userRoles)
      .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
      .innerJoin(
        permissionActionBindings,
        eq(rolePermissions.permissionId, permissionActionBindings.permissionId),
      )
      .where(eq(userRoles.userId, userId))
      .orderBy(asc(permissionActionBindings.action));
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
    const permissionMap = await this.getPermissionsByRoleIds([id]);
    return {
      ...toRoleSummary(row),
      isSystem: row.isSystem,
      permissions: permissionMap.get(id) ?? [],
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

  private async getPermissionsByRoleIds(roleIds: string[]): Promise<Map<string, PermissionSummary[]>> {
    if (roleIds.length === 0) return new Map();
    const rows = await this.db
      .select({ roleId: rolePermissions.roleId, permission: permissions })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(inArray(rolePermissions.roleId, roleIds))
      .orderBy(asc(permissions.name));
    const map = new Map<string, PermissionSummary[]>();
    for (const row of rows) {
      const list = map.get(row.roleId) ?? [];
      list.push(toPermissionSummary(row.permission));
      map.set(row.roleId, list);
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

  private async assertPermissionExists(id: string): Promise<void> {
    const rows = await this.db
      .select({ id: permissions.id })
      .from(permissions)
      .where(eq(permissions.id, id))
      .limit(1);
    if (!rows[0]) throw new NotFoundException('权限点不存在');
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

  private async grantPermissionToSuperAdmin(permissionId: string): Promise<void> {
    const roleId = await this.getSuperAdminRoleId();
    if (!roleId) return;
    await this.db.insert(rolePermissions).values({ roleId, permissionId }).onConflictDoNothing();
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

  private async assertPermissionsExist(permissionIds: string[]): Promise<void> {
    const uniquePermissionIds = [...new Set(permissionIds)];
    if (uniquePermissionIds.length === 0) return;
    const rows = await this.db
      .select({ id: permissions.id })
      .from(permissions)
      .where(inArray(permissions.id, uniquePermissionIds));
    if (rows.length !== uniquePermissionIds.length) {
      throw new BadRequestException('权限点不存在');
    }
  }
  private buildKeywordWhere(keyword: string | undefined, nameColumn: typeof roles.name, keyColumn: typeof roles.key) {
    if (!keyword) return undefined;
    const pattern = `%${keyword}%`;
    return or(ilike(nameColumn, pattern), ilike(keyColumn, pattern));
  }
}
