import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { inArray } from 'drizzle-orm';
import type { Request } from 'express';
import { permissionActionBindings } from '@feed-plan/db';
import type { JwtPayload } from '@feed-plan/shared';
import { DRIZZLE, type DrizzleDb } from '../drizzle/drizzle.constants.js';
import type { AccessAction } from './access-actions.js';
import { ACCESS_ACTIONS_KEY } from './access.decorator.js';

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
    if (!required || required.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    const permissionIds = req.user?.permissions?.map((permission) => permission.id) ?? [];
    if (permissionIds.length === 0) {
      throw new ForbiddenException('无权访问该资源');
    }

    const rows = await this.db
      .select({ action: permissionActionBindings.action })
      .from(permissionActionBindings)
      .where(inArray(permissionActionBindings.permissionId, permissionIds));

    const allowed = new Set(rows.map((row) => row.action));
    if (!required.every((action) => allowed.has(action))) {
      throw new ForbiddenException('无权访问该资源');
    }
    return true;
  }
}
