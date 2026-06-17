import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { JwtPayload, Role } from '@feed-plan/shared';
import { ROLES_KEY } from './roles.decorator.js';

/**
 * 基于角色的访问控制。必须在 JwtAuthGuard 之后运行（依赖 req.user）。
 * 未标注 @Roles 的接口默认放行（只要已登录）。
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) {
      return true;
    }
    const req = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    const user = req.user;
    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException('无权访问该资源');
    }
    return true;
  }
}
