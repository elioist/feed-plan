import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { jwtPayloadSchema, type JwtPayload } from '@feed-plan/shared';

/** 校验 Bearer JWT，通过后将负载挂到 req.user */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少访问令牌');
    }
    const token = header.slice('Bearer '.length);
    try {
      const rawPayload = await this.jwt.verifyAsync<Record<string, unknown>>(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });
      const payload = jwtPayloadSchema.safeParse(rawPayload);
      if (!payload.success) {
        throw new UnauthorizedException('访问令牌无效或已过期');
      }
      (req as Request & { user: JwtPayload }).user = payload.data;
      return true;
    } catch {
      throw new UnauthorizedException('访问令牌无效或已过期');
    }
  }
}
