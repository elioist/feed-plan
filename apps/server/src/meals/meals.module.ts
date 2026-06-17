import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { MealsController } from './meals.controller.js';
import { MealsService } from './meals.service.js';

@Module({
  imports: [AuthModule],
  controllers: [MealsController],
  providers: [MealsService],
  exports: [MealsService],
})
export class MealsModule {}
