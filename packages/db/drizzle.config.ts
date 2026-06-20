import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

/**
 * drizzle-kit 配置。
 * 加载仓库根 .env 获取 DATABASE_URL（drizzle-kit 是独立进程，读不到 NestJS ConfigModule）。
 * 已存在的环境变量（docker-compose / CI 注入）优先，不被 .env 覆盖。
 * migration SQL 输出到 ./drizzle 目录，纳入版本控制。
 */
const configDir = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(configDir, '../../.env') });

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/feed_plan',
  },
  verbose: true,
  strict: true,
});
