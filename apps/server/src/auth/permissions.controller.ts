import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  accessListQuerySchema,
  createPermissionSchema,
  idParamSchema,
  updatePermissionSchema,
  type AccessListQuery,
  type CreatePermissionInput,
  type IdParam,
  type Permission,
  type UpdatePermissionInput,
} from '@feed-plan/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { AccessGuard } from './access.guard.js';
import { ACCESS_ACTIONS } from './access-actions.js';
import { RequireAccess } from './access.decorator.js';
import { AccessService } from './access.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('permissions')
@UseGuards(JwtAuthGuard, AccessGuard)
@RequireAccess(ACCESS_ACTIONS.permissionsManage)
export class PermissionsController {
  constructor(private readonly access: AccessService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(accessListQuerySchema)) query: AccessListQuery,
  ): Promise<Permission[]> {
    return this.access.listPermissions(query);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createPermissionSchema)) body: CreatePermissionInput,
  ): Promise<Permission> {
    return this.access.createPermission(body);
  }

  @Patch(':id')
  update(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParam,
    @Body(new ZodValidationPipe(updatePermissionSchema)) body: UpdatePermissionInput,
  ): Promise<Permission> {
    return this.access.updatePermission(params.id, body);
  }

  @Delete(':id')
  async remove(@Param(new ZodValidationPipe(idParamSchema)) params: IdParam) {
    await this.access.removePermission(params.id);
    return { ok: true };
  }
}
