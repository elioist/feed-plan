import { z } from 'zod';

/**
 * 环境变量校验 schema。
 * 应用启动时校验，缺失或非法立即失败，避免运行期才暴露配置问题。
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET 至少 16 个字符'),
  JWT_EXPIRES_IN: z.string().default('30d'),
});

export type Env = z.infer<typeof envSchema>;

/** 供 @nestjs/config 的 validate 选项使用 */
export function validateEnv(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
