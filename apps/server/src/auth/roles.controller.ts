import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  accessListQuerySchema,
  createRoleSchema,
  idParamSchema,
  updateRoleSchema,
  type AccessListQuery,
  type CreateRoleInput,
  type IdParam,
  type Role,
  type UpdateRoleInput,
} from '@feed-plan/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { AccessGuard } from './access.guard.js';
import { ACCESS_ACTIONS } from './access-actions.js';
import { RequireAccess } from './access.decorator.js';
import { AccessService } from './access.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('roles')
@UseGuards(JwtAuthGuard, AccessGuard)
@RequireAccess(ACCESS_ACTIONS.rolesManage)
export class RolesController {
  constructor(private readonly access: AccessService) {}

  @Get()
  list(@Query(new ZodValidationPipe(accessListQuerySchema)) query: AccessListQuery): Promise<Role[]> {
    return this.access.listRoles(query);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createRoleSchema)) body: CreateRoleInput): Promise<Role> {
    return this.access.createRole(body);
  }

  @Patch(':id')
  update(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParam,
    @Body(new ZodValidationPipe(updateRoleSchema)) body: UpdateRoleInput,
  ): Promise<Role> {
    return this.access.updateRole(params.id, body);
  }

  @Delete(':id')
  async remove(@Param(new ZodValidationPipe(idParamSchema)) params: IdParam) {
    await this.access.removeRole(params.id);
    return { ok: true };
  }
}
