import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { ROLES } from '@feed-plan/shared';

/**
 * 用户表 —— 本次 bootstrap-auth 仅认证所需字段。
 * role 取值为 ROLES（chef | diner），以 varchar 存储并由应用层 + Zod 约束。
 */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 64 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 16 }).notNull().$type<(typeof ROLES)[number]>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
