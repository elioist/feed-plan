import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  createDishSchema,
  dishListQuerySchema,
  idParamSchema,
  updateDishActiveSchema,
  updateDishSchema,
  type CreateDishInput,
  type DishListQuery,
  type IdParam,
  type JwtPayload,
  type UpdateDishActiveInput,
  type UpdateDishInput,
} from '@feed-plan/shared';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AccessGuard } from '../auth/access.guard.js';
import { ACCESS_ACTIONS } from '../auth/access-actions.js';
import { RequireAccess } from '../auth/access.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { DishesService } from './dishes.service.js';

@Controller('dishes')
@UseGuards(JwtAuthGuard)
export class DishesController {
  constructor(private readonly dishes: DishesService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(dishListQuerySchema)) query: DishListQuery,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.dishes.list(query, user);
  }

  @Get(':id')
  getById(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParam,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.dishes.getById(params.id, user);
  }

  @Post()
  @UseGuards(AccessGuard)
  @RequireAccess(ACCESS_ACTIONS.recipesManage)
  create(@Body(new ZodValidationPipe(createDishSchema)) body: CreateDishInput) {
    return this.dishes.create(body);
  }

  @Patch(':id')
  @UseGuards(AccessGuard)
  @RequireAccess(ACCESS_ACTIONS.recipesManage)
  update(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParam,
    @Body(new ZodValidationPipe(updateDishSchema)) body: UpdateDishInput,
  ) {
    return this.dishes.update(params.id, body);
  }

  @Patch(':id/active')
  @UseGuards(AccessGuard)
  @RequireAccess(ACCESS_ACTIONS.recipesManage)
  setActive(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParam,
    @Body(new ZodValidationPipe(updateDishActiveSchema)) body: UpdateDishActiveInput,
  ) {
    return this.dishes.setActive(params.id, body);
  }

  @Delete(':id')
  @UseGuards(AccessGuard)
  @RequireAccess(ACCESS_ACTIONS.recipesManage)
  remove(@Param(new ZodValidationPipe(idParamSchema)) params: IdParam) {
    return this.dishes.remove(params.id).then(() => ({ ok: true }));
  }
}
