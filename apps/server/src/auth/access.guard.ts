import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { and, eq, inArray } from 'drizzle-orm';
import type { Request } from 'express';
import { adminMenuButtons, adminMenus, roleMenuButtons, roleMenus, userRoles } from '@feed-plan/db';
import type { JwtPayload } from '@feed-plan/shared';
import { DRIZZLE, type DrizzleDb } from '../drizzle/drizzle.constants.js';
import type { AccessAction } from './access-actions.js';
import { ACCESS_ACTIONS_KEY, ACCESS_MENUS_KEY } from './access.decorator.js';

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<AccessAction[] | undefined>(
      ACCESS_ACTIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    const requiredMenus = this.reflector.getAllAndOverride<string[] | undefined>(
      ACCESS_MENUS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if ((!required || required.length === 0) && (!requiredMenus || requiredMenus.length === 0)) return true;

    const req = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    const userId = req.user?.sub;
    if (!userId) {
      throw new ForbiddenException('无权访问该资源');
    }

    if (requiredMenus && requiredMenus.length > 0) {
      const rows = await this.db
        .select({ key: adminMenus.key })
        .from(userRoles)
        .innerJoin(roleMenus, eq(userRoles.roleId, roleMenus.roleId))
        .innerJoin(adminMenus, eq(roleMenus.menuId, adminMenus.id))
        .where(and(eq(userRoles.userId, userId), inArray(adminMenus.key, requiredMenus)));
      const allowed = new Set(rows.map((row) => row.key));
      if (!requiredMenus.every((key) => allowed.has(key))) {
        throw new ForbiddenException('无权访问该资源');
      }
    }

    if (required && required.length > 0) {
      const rows = await this.db
        .select({ action: adminMenuButtons.action })
        .from(userRoles)
        .innerJoin(roleMenuButtons, eq(userRoles.roleId, roleMenuButtons.roleId))
        .innerJoin(adminMenuButtons, eq(roleMenuButtons.buttonId, adminMenuButtons.id))
        .where(and(eq(userRoles.userId, userId), inArray(adminMenuButtons.action, [...required])));
      const allowed = new Set(rows.map((row) => row.action));
      if (!required.every((action) => allowed.has(action))) {
        throw new ForbiddenException('无权访问该资源');
      }
    }
    return true;
  }
}
