import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDb } from '@feed-plan/db';
import { DRIZZLE } from './drizzle.constants.js';

/**
 * 将 Drizzle 数据库实例封装为可注入 provider。
 * 连接串从 ConfigService 读取（已由 env schema 校验），
 * 全局模块，任意模块可 @Inject(DRIZZLE) 使用。
 */
@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow<string>('DATABASE_URL');
        return createDb(url);
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
