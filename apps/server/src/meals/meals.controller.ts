import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  addOrderInputSchema,
  currentMealInputSchema,
  idParamSchema,
  mealQuerySchema,
  type AddOrderInput,
  type CurrentMealInput,
  type IdParam,
  type JwtPayload,
  type MealQuery,
} from '@feed-plan/shared';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AccessGuard } from '../auth/access.guard.js';
import { ACCESS_ACTIONS } from '../auth/access-actions.js';
import { RequireAccess } from '../auth/access.decorator.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { MealsService } from './meals.service.js';

@Controller('meals')
@UseGuards(JwtAuthGuard)
export class MealsController {
  constructor(private readonly meals: MealsService) {}

  @Post('current')
  getOrCreateCurrent(
    @Body(new ZodValidationPipe(currentMealInputSchema)) body: CurrentMealInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.meals.getOrCreateCurrent(body, user);
  }

  @Get('today')
  listToday(@Query(new ZodValidationPipe(mealQuerySchema)) query: MealQuery) {
    return this.meals.listToday(query);
  }

  @Get()
  list(@Query(new ZodValidationPipe(mealQuerySchema)) query: MealQuery) {
    return this.meals.list(query);
  }

  @Get(':id')
  getDetail(@Param(new ZodValidationPipe(idParamSchema)) params: IdParam) {
    return this.meals.getDetail(params.id);
  }

  @Post(':id/orders')
  addOrder(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParam,
    @Body(new ZodValidationPipe(addOrderInputSchema)) body: AddOrderInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.meals.addOrder(params.id, body, user);
  }

  @Patch(':id/complete')
  @UseGuards(AccessGuard)
  @RequireAccess(ACCESS_ACTIONS.mealsComplete)
  complete(@Param(new ZodValidationPipe(idParamSchema)) params: IdParam) {
    return this.meals.complete(params.id);
  }
}
