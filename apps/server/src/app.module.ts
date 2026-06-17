import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.schema.js';
import { DrizzleModule } from './drizzle/drizzle.module.js';
import { AuthModule } from './auth/auth.module.js';
import { HealthController } from './health/health.controller.js';
import { RecipesModule } from './recipes/recipes.module.js';
import { MealsModule } from './meals/meals.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    DrizzleModule,
    AuthModule,
    RecipesModule,
    MealsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
