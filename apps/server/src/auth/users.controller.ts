import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  createUserSchema,
  idParamSchema,
  updateUserRoleSchema,
  type AdminUser,
  type CreateUserInput,
  type IdParam,
  type JwtPayload,
  type UpdateUserRoleInput,
} from '@feed-plan/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { CurrentUser } from './current-user.decorator.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { Roles } from './roles.decorator.js';
import { RolesGuard } from './roles.guard.js';
import { UsersService } from './users.service.js';

/** 用户管理接口，全部仅限主厨（chef）访问 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('chef')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(): Promise<AdminUser[]> {
    return this.users.list();
  }

  @Post()
  create(@Body(new ZodValidationPipe(createUserSchema)) body: CreateUserInput): Promise<AdminUser> {
    return this.users.create(body);
  }

  @Patch(':id')
  updateRole(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParam,
    @Body(new ZodValidationPipe(updateUserRoleSchema)) body: UpdateUserRoleInput,
    @CurrentUser() operator: JwtPayload,
  ): Promise<AdminUser> {
    return this.users.updateRole(params.id, body.role, operator.sub);
  }

  @Delete(':id')
  remove(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParam,
    @CurrentUser() operator: JwtPayload,
  ) {
    return this.users.remove(params.id, operator.sub).then(() => ({ ok: true }));
  }
}
