import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';
import { DishesController } from './dishes.controller.js';
import { DishesService } from './dishes.service.js';
import { TagsController } from './tags.controller.js';
import { TagsService } from './tags.service.js';

@Module({
  imports: [AuthModule],
  controllers: [CategoriesController, DishesController, TagsController],
  providers: [CategoriesService, DishesService, TagsService],
  exports: [CategoriesService, DishesService, TagsService],
})
export class RecipesModule {}
