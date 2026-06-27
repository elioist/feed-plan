import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  accessListQuerySchema,
  createMenuButtonSchema,
  createMenuSchema,
  idParamSchema,
  updateMenuButtonSchema,
  updateMenuSchema,
  updateRoleMenusSchema,
  type AccessListQuery,
  type AdminMenu,
  type CreateMenuButtonInput,
  type CreateMenuInput,
  type IdParam,
  type MenuButton,
  type RoleMenuAccess,
  type UpdateMenuButtonInput,
  type UpdateMenuInput,
  type UpdateRoleMenusInput,
} from '@feed-plan/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { AccessGuard } from './access.guard.js';
import { ACCESS_ACTIONS } from './access-actions.js';
import { RequireAccess } from './access.decorator.js';
import { AccessService } from './access.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller()
@UseGuards(JwtAuthGuard, AccessGuard)
@RequireAccess(ACCESS_ACTIONS.menusManage)
export class MenusController {
  constructor(private readonly access: AccessService) {}

  @Get('menus')
  list(@Query(new ZodValidationPipe(accessListQuerySchema)) query: AccessListQuery): Promise<AdminMenu[]> {
    return this.access.listMenus(query);
  }

  @Post('menus')
  create(@Body(new ZodValidationPipe(createMenuSchema)) body: CreateMenuInput): Promise<AdminMenu> {
    return this.access.createMenu(body);
  }

  @Patch('menus/:id')
  update(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParam,
    @Body(new ZodValidationPipe(updateMenuSchema)) body: UpdateMenuInput,
  ): Promise<AdminMenu> {
    return this.access.updateMenu(params.id, body);
  }

  @Delete('menus/:id')
  async remove(@Param(new ZodValidationPipe(idParamSchema)) params: IdParam) {
    await this.access.removeMenu(params.id);
    return { ok: true };
  }

  @Post('menu-buttons')
  createButton(@Body(new ZodValidationPipe(createMenuButtonSchema)) body: CreateMenuButtonInput): Promise<MenuButton> {
    return this.access.createMenuButton(body);
  }

  @Patch('menu-buttons/:id')
  updateButton(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParam,
    @Body(new ZodValidationPipe(updateMenuButtonSchema)) body: UpdateMenuButtonInput,
  ): Promise<MenuButton> {
    return this.access.updateMenuButton(params.id, body);
  }

  @Delete('menu-buttons/:id')
  async removeButton(@Param(new ZodValidationPipe(idParamSchema)) params: IdParam) {
    await this.access.removeMenuButton(params.id);
    return { ok: true };
  }

  @Get('roles/:id/menu-access')
  getRoleMenuAccess(@Param(new ZodValidationPipe(idParamSchema)) params: IdParam): Promise<RoleMenuAccess> {
    return this.access.getRoleMenuAccess(params.id);
  }

  @Patch('roles/:id/menu-access')
  async updateRoleMenuAccess(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParam,
    @Body(new ZodValidationPipe(updateRoleMenusSchema)) body: UpdateRoleMenusInput,
  ) {
    await this.access.replaceRoleMenuAccess(params.id, body);
    return { ok: true };
  }
}
