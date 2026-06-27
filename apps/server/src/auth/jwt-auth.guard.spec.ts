import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { describe, expect, it, vi } from 'vitest';
import type { JwtPayload } from '@feed-plan/shared';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { ACCESS_ACTIONS } from './access-actions.js';

const validPayload: JwtPayload = {
  sub: '11111111-1111-4111-8111-111111111111',
  username: 'chef',
  roles: [{ id: '22222222-2222-4222-8222-222222222222', key: 'chef', name: '主厨', description: null }],
  permissions: [
    {
      id: '33333333-3333-4333-8333-333333333333',
      key: 'users.manage',
      name: '用户管理',
      description: null,
    },
  ],
  actions: [ACCESS_ACTIONS.usersManage],
  menuKeys: [],
  buttonKeys: [],
};

function makeContext(authorization?: string): { context: ExecutionContext; request: Request } {
  const request = {
    headers: authorization === undefined ? {} : { authorization },
  } as Request;

  return {
    context: {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext,
    request,
  };
}

function makeGuard(payload: unknown) {
  const jwt = {
    verifyAsync: vi.fn(async () => payload),
  } as unknown as JwtService;
  const config = {
    getOrThrow: vi.fn(() => 'test-secret'),
  } as unknown as ConfigService;

  return {
    guard: new JwtAuthGuard(jwt, config),
    jwt,
  };
}

describe('JwtAuthGuard', () => {
  it('缺少 Bearer token 时返回 401', async () => {
    const { guard } = makeGuard(validPayload);
    const { context } = makeContext();

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('拒绝旧版 JWT payload，避免权限层读取 undefined', async () => {
    const { guard } = makeGuard({
      sub: validPayload.sub,
      username: 'chef',
      role: 'chef',
    });
    const { context } = makeContext('Bearer old-token');

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('校验通过后把标准 payload 挂到请求上', async () => {
    const { guard, jwt } = makeGuard(validPayload);
    const { context, request } = makeContext('Bearer fresh-token');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(jwt.verifyAsync).toHaveBeenCalledWith('fresh-token', { secret: 'test-secret' });
    expect((request as Request & { user?: JwtPayload }).user).toEqual(validPayload);
  });
});
