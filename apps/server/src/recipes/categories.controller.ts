import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  categoryListQuerySchema,
  createCategorySchema,
  idParamSchema,
  updateCategorySchema,
  type Category,
  type CategoryListQuery,
  type CreateCategoryInput,
  type IdParam,
  type UpdateCategoryInput,
} from '@feed-plan/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AccessGuard } from '../auth/access.guard.js';
import { ACCESS_ACTIONS } from '../auth/access-actions.js';
import { RequireAccess } from '../auth/access.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { CategoriesService } from './categories.service.js';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  list(@Query(new ZodValidationPipe(categoryListQuerySchema)) query: CategoryListQuery): Promise<Category[]> {
    return this.categories.list(query);
  }

  @Post()
  @UseGuards(AccessGuard)
  @RequireAccess(ACCESS_ACTIONS.recipesManage)
  create(@Body(new ZodValidationPipe(createCategorySchema)) body: CreateCategoryInput) {
    return this.categories.create(body);
  }

  @Patch(':id')
  @UseGuards(AccessGuard)
  @RequireAccess(ACCESS_ACTIONS.recipesManage)
  update(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParam,
    @Body(new ZodValidationPipe(updateCategorySchema)) body: UpdateCategoryInput,
  ) {
    return this.categories.update(params.id, body);
  }

  @Delete(':id')
  @UseGuards(AccessGuard)
  @RequireAccess(ACCESS_ACTIONS.recipesManage)
  remove(@Param(new ZodValidationPipe(idParamSchema)) params: IdParam) {
    return this.categories.remove(params.id).then(() => ({ ok: true }));
  }
}
