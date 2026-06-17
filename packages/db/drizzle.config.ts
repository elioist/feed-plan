import { defineConfig } from 'drizzle-kit';

/**
 * drizzle-kit 配置。
 * DATABASE_URL 由运行环境提供（本地 .env / docker-compose）。
 * migration SQL 输出到 ./drizzle 目录，纳入版本控制。
 */
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
