import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  createCategorySchema,
  idParamSchema,
  updateCategorySchema,
  type Category,
  type CreateCategoryInput,
  type IdParam,
  type UpdateCategoryInput,
} from '@feed-plan/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { CategoriesService } from './categories.service.js';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  list(): Promise<Category[]> {
    return this.categories.list();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('chef')
  create(@Body(new ZodValidationPipe(createCategorySchema)) body: CreateCategoryInput) {
    return this.categories.create(body);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('chef')
  update(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParam,
    @Body(new ZodValidationPipe(updateCategorySchema)) body: UpdateCategoryInput,
  ) {
    return this.categories.update(params.id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('chef')
  remove(@Param(new ZodValidationPipe(idParamSchema)) params: IdParam) {
    return this.categories.remove(params.id).then(() => ({ ok: true }));
  }
}
