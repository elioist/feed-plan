import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '@feed-plan/shared';

/** 从请求中取出当前登录用户（由 JwtAuthGuard 注入的 req.user） */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload => {
    const req = context.switchToHttp().getRequest<Request & { user: JwtPayload }>();
    return req.user;
  },
);
