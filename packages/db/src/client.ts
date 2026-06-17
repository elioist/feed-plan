import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index.js';

export type DbSchema = typeof schema;
export type Database = ReturnType<typeof createDb>;

/**
 * 创建 Drizzle 数据库实例。
 * 连接串由调用方（后端的 DrizzleModule）从环境变量传入，
 * 本包不直接读取 env，保持可测试与可复用。
 */
export function createDb(connectionString: string) {
  const pool = new Pool({ connectionString });
  return drizzle(pool, { schema });
}
