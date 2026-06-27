import { describe, expect, it, vi } from 'vitest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { JwtPayload } from '@feed-plan/shared';
import { AccessGuard } from './access.guard.js';
import { ACCESS_ACTIONS } from './access-actions.js';

const user: JwtPayload = {
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

function makeContext(currentUser: JwtPayload | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user: currentUser }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

function makeGuard(required: string[] | undefined, actions: string[]) {
  const reflector = {
    getAllAndOverride: () => required,
  } as unknown as Reflector;
  const db = {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(async () => actions.map((action) => ({ action }))),
      })),
    })),
  };
  return new AccessGuard(reflector, db as never);
}

describe('AccessGuard', () => {
  it('未声明动作时放行', async () => {
    await expect(makeGuard(undefined, []).canActivate(makeContext(user))).resolves.toBe(true);
  });

  it('用户权限点覆盖动作时放行', async () => {
    await expect(
      makeGuard([ACCESS_ACTIONS.usersManage], [ACCESS_ACTIONS.usersManage]).canActivate(
        makeContext(user),
      ),
    ).resolves.toBe(true);
  });

  it('用户权限点未覆盖动作时返回 403', async () => {
    await expect(
      makeGuard([ACCESS_ACTIONS.rolesManage], [ACCESS_ACTIONS.usersManage]).canActivate(
        makeContext(user),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
