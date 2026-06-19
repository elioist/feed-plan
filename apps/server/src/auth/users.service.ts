import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { users, type UserRow } from '@feed-plan/db';
import type { AdminUser, CreateUserInput, Role } from '@feed-plan/shared';
import { DRIZZLE, type DrizzleDb } from '../drizzle/drizzle.constants.js';
import { isForeignKeyViolation, isUniqueViolation } from '../common/db-errors.js';

function toAdminUser(row: UserRow): AdminUser {
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    createdAt: row.createdAt,
  };
}

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  /** 按用户名查询用户，不存在返回 null */
  async findByUsername(username: string): Promise<UserRow | null> {
    const rows = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return rows[0] ?? null;
  }

  /** 校验明文密码与存储的 bcrypt 哈希是否匹配 */
  verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  /** 用户列表（管理后台，不含密码哈希） */
  async list(): Promise<AdminUser[]> {
    const rows = await this.db.select().from(users).orderBy(asc(users.createdAt));
    return rows.map(toAdminUser);
  }

  /** 创建用户 */
  async create(input: CreateUserInput): Promise<AdminUser> {
    const passwordHash = await bcrypt.hash(input.password, 10);
    try {
      const [row] = await this.db
        .insert(users)
        .values({ username: input.username, passwordHash, role: input.role })
        .returning();
      if (!row) {
        throw new ConflictException('用户创建失败');
      }
      return toAdminUser(row);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('用户名已存在');
      }
      throw error;
    }
  }

  /** 修改用户角色。operatorId 为当前操作者，禁止修改自己的角色。 */
  async updateRole(id: string, role: Role, operatorId: string): Promise<AdminUser> {
    if (id === operatorId) {
      throw new ConflictException('不能修改自己的角色');
    }
    const [row] = await this.db.update(users).set({ role }).where(eq(users.id, id)).returning();
    if (!row) {
      throw new NotFoundException('用户不存在');
    }
    return toAdminUser(row);
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
}
