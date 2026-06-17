import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';
import { DishesController } from './dishes.controller.js';
import { DishesService } from './dishes.service.js';

@Module({
  imports: [AuthModule],
  controllers: [CategoriesController, DishesController],
  providers: [CategoriesService, DishesService],
  exports: [CategoriesService, DishesService],
})
export class RecipesModule {}
