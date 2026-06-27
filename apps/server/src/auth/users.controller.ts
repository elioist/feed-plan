import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  createUserSchema,
  idParamSchema,
  resetUserPasswordSchema,
  updateUserRolesSchema,
  userListQuerySchema,
  type AdminUser,
  type CreateUserInput,
  type IdParam,
  type JwtPayload,
  type ResetUserPasswordInput,
  type UpdateUserRolesInput,
  type UserListQuery,
} from '@feed-plan/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { CurrentUser } from './current-user.decorator.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { AccessGuard } from './access.guard.js';
import { ACCESS_ACTIONS } from './access-actions.js';
import { RequireAccess } from './access.decorator.js';
import { UsersService } from './users.service.js';

/** 用户管理接口，全部要求用户管理权限。 */
@Controller('users')
@UseGuards(JwtAuthGuard, AccessGuard)
@RequireAccess(ACCESS_ACTIONS.usersManage)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(@Query(new ZodValidationPipe(userListQuerySchema)) query: UserListQuery): Promise<AdminUser[]> {
    return this.users.list(query);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createUserSchema)) body: CreateUserInput): Promise<AdminUser> {
    return this.users.create(body);
  }

  @Patch(':id')
  updateRoles(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParam,
    @Body(new ZodValidationPipe(updateUserRolesSchema)) body: UpdateUserRolesInput,
    @CurrentUser() operator: JwtPayload,
  ): Promise<AdminUser> {
    return this.users.updateRoles(params.id, body, operator.sub);
  }

  @Patch(':id/password')
  async resetPassword(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParam,
    @Body(new ZodValidationPipe(resetUserPasswordSchema)) body: ResetUserPasswordInput,
    @CurrentUser() operator: JwtPayload,
  ) {
    await this.users.resetPassword(params.id, body.password, operator.sub);
    return { ok: true };
  }

  @Delete(':id')
  remove(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParam,
    @CurrentUser() operator: JwtPayload,
  ) {
    return this.users.remove(params.id, operator.sub).then(() => ({ ok: true }));
  }
}
