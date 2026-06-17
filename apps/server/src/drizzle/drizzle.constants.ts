import type { Database } from '@feed-plan/db';

/** Drizzle 数据库实例的注入令牌 */
export const DRIZZLE = Symbol('DRIZZLE');

/** 注入类型别名，供 @Inject(DRIZZLE) private db: DrizzleDb 使用 */
export type DrizzleDb = Database;
