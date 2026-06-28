import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { and, asc, eq, ilike } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { userRoles, users, type UserRow } from '@feed-plan/db';
import type {
  AdminUser,
  AuthUser,
  ChangePasswordInput,
  CreateUserInput,
  UpdateUserInput,
  UpdateUserRolesInput,
  UserListQuery,
} from '@feed-plan/shared';
import { DRIZZLE, type DrizzleDb } from '../drizzle/drizzle.constants.js';
import { isForeignKeyViolation, isUniqueViolation } from '../common/db-errors.js';
import { AccessService } from './access.service.js';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly access: AccessService,
  ) {}

  /** 按用户名查询用户，不存在返回 null */
  async findByUsername(username: string): Promise<UserRow | null> {
    const rows = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return rows[0] ?? null;
  }

  /** 按 id 查询用户，不存在返回 null */
  async findById(id: string): Promise<UserRow | null> {
    const rows = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ?? null;
  }

  /** 校验明文密码与存储的 bcrypt 哈希是否匹配 */
  verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  async getAuthUser(id: string): Promise<AuthUser | null> {
    const row = await this.findById(id);
    if (!row) return null;
    return this.toAuthUser(row);
  }

  /** 用户列表（管理后台，不含密码哈希） */
  async list(query: UserListQuery = {}): Promise<AdminUser[]> {
    const conditions = [];
    if (query.keyword) {
      conditions.push(ilike(users.username, `%${query.keyword}%`));
    }
    if (query.roleId) {
      const rows = await this.db
        .select({ user: users })
        .from(users)
        .innerJoin(userRoles, eq(users.id, userRoles.userId))
        .where(and(...conditions, eq(userRoles.roleId, query.roleId)))
        .orderBy(asc(users.createdAt));
      return Promise.all(rows.map((row) => this.toAdminUser(row.user)));
    }
    const rows = await this.db
      .select()
      .from(users)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(users.createdAt));
    return Promise.all(rows.map((row) => this.toAdminUser(row)));
  }

  /** 创建用户 */
  async create(input: CreateUserInput): Promise<AdminUser> {
    await this.access.assertRolesExist(input.roleIds);
    const passwordHash = await this.hashPassword(input.password);
    try {
      const [row] = await this.db
        .insert(users)
        .values({ username: input.username, passwordHash })
        .returning();
      if (!row) {
        throw new ConflictException('用户创建失败');
      }
      await this.replaceUserRoles(row.id, input.roleIds);
      return this.toAdminUser(row);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('用户名已存在');
      }
      throw error;
    }
  }

  /** 修改用户角色集合。 */
  async updateRoles(
    id: string,
    input: UpdateUserRolesInput,
    operatorId: string,
  ): Promise<AdminUser> {
    await this.assertUserExists(id);
    await this.access.assertRolesExist(input.roleIds);
    if (id === operatorId && !(await this.access.roleIdsKeepManagementAccess(input.roleIds))) {
      throw new ConflictException('不能移除自己的最后管理权限');
    }
    await this.replaceUserRoles(id, input.roleIds);
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('用户不存在');
    return this.toAdminUser(user);
  }

  /** 当前用户修改自己的密码，需要校验旧密码。 */
  async changePassword(id: string, input: ChangePasswordInput): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const ok = await this.verifyPassword(input.currentPassword, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('当前密码错误');
    }

    await this.updatePasswordHash(id, input.newPassword);
  }

  /** 主厨重置其他用户密码，禁止通过该路径重置自己。 */
  async resetPassword(id: string, password: string, operatorId: string): Promise<void> {
    if (id === operatorId) {
      throw new ConflictException('请使用修改自己密码流程');
    }
    await this.assertUserExists(id);
    await this.updatePasswordHash(id, password);
  }

  /** 删除用户。禁止删除自己；被 meal 引用时返回 409。 */
  async remove(id: string, operatorId: string): Promise<void> {
    if (id === operatorId) {
      throw new ConflictException('不能删除自己');
    }
    await this.assertUserExists(id);
    try {
      await this.db.delete(users).where(eq(users.id, id));
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException('该用户已创建点餐记录，不能删除');
      }
      throw error;
    }
  }

  /** 编辑用户信息（用户名、头像） */
  async update(id: string, input: UpdateUserInput): Promise<AdminUser> {
    await this.assertUserExists(id);

    // 用户名唯一性校验
    if (input.username) {
      const existing = await this.findByUsername(input.username);
      if (existing && existing.id !== id) {
        throw new ConflictException('用户名已存在');
      }
    }

    const updateData: { username?: string; avatar?: string | null } = {};
    if (input.username !== undefined) {
      updateData.username = input.username;
    }
    if (input.avatar !== undefined) {
      updateData.avatar = input.avatar;
    }

    if (Object.keys(updateData).length === 0) {
      const user = await this.findById(id);
      if (!user) throw new NotFoundException('用户不存在');
      return this.toAdminUser(user);
    }

    const [row] = await this.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    if (!row) {
      throw new NotFoundException('用户不存在');
    }

    return this.toAdminUser(row);
  }

  private async assertUserExists(id: string): Promise<void> {
    const rows = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (!rows[0]) {
      throw new NotFoundException('用户不存在');
    }
  }

  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async updatePasswordHash(id: string, password: string): Promise<void> {
    const [row] = await this.db
      .update(users)
      .set({ passwordHash: await this.hashPassword(password) })
      .where(eq(users.id, id))
      .returning();
    if (!row) {
      throw new NotFoundException('用户不存在');
    }
  }

  private async replaceUserRoles(userId: string, roleIds: string[]): Promise<void> {
    const uniqueRoleIds = [...new Set(roleIds)];
    await this.db.delete(userRoles).where(eq(userRoles.userId, userId));
    if (uniqueRoleIds.length > 0) {
      await this.db.insert(userRoles).values(uniqueRoleIds.map((roleId) => ({ userId, roleId })));
    }
  }

  private async toAuthUser(row: UserRow): Promise<AuthUser> {
    return {
      id: row.id,
      username: row.username,
      avatar: row.avatar ?? null,
      roles: await this.access.getUserRoles(row.id),
      actions: await this.access.getUserActions(row.id),
      menuKeys: await this.access.getUserMenuKeys(row.id),
      buttonKeys: await this.access.getUserButtonKeys(row.id),
    };
  }

  private async toAdminUser(row: UserRow): Promise<AdminUser> {
    return {
      ...(await this.toAuthUser(row)),
      createdAt: row.createdAt,
    };
  }
}
