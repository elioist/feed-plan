import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { users, type UserRow } from '@feed-plan/db';
import { DRIZZLE, type DrizzleDb } from '../drizzle/drizzle.constants.js';

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
}
