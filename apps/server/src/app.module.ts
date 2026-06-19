import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.schema.js';
import { DrizzleModule } from './drizzle/drizzle.module.js';
import { AuthModule } from './auth/auth.module.js';
import { HealthController } from './health/health.controller.js';
import { RecipesModule } from './recipes/recipes.module.js';
import { MealsModule } from './meals/meals.module.js';
import { UploadsModule } from './uploads/uploads.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/server/.env', '.env', '../../.env'],
      validate: validateEnv,
    }),
    DrizzleModule,
    AuthModule,
    RecipesModule,
    MealsModule,
    UploadsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
