import { describe, expect, it, vi } from 'vitest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { JwtPayload } from '@feed-plan/shared';
import { AccessGuard } from './access.guard.js';
import { ACCESS_ACTIONS } from './access-actions.js';
import { ACCESS_ACTIONS_KEY, ACCESS_MENUS_KEY } from './access.decorator.js';

const user: JwtPayload = {
  sub: '11111111-1111-4111-8111-111111111111',
  username: 'chef',
  roles: [{ id: '22222222-2222-4222-8222-222222222222', key: 'chef', name: '主厨', description: null }],
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

function makeGuard(
  requiredActions: string[] | undefined,
  grantedActions: string[],
  requiredMenus?: string[],
  grantedMenus: string[] = [],
) {
  const reflector = {
    getAllAndOverride: (key: string) => {
      if (key === ACCESS_ACTIONS_KEY) return requiredActions;
      if (key === ACCESS_MENUS_KEY) return requiredMenus;
      return undefined;
    },
  } as unknown as Reflector;
  const query = {
    innerJoin: vi.fn(() => query),
    where: vi.fn(async () => [
      ...grantedActions.map((action) => ({ action })),
      ...grantedMenus.map((key) => ({ key })),
    ]),
  };
  const db = {
    select: vi.fn(() => ({
      from: vi.fn(() => query),
    })),
  };
  return new AccessGuard(reflector, db as never);
}

describe('AccessGuard', () => {
  it('未声明动作时放行', async () => {
    await expect(makeGuard(undefined, []).canActivate(makeContext(user))).resolves.toBe(true);
  });

  it('用户按钮动作覆盖接口动作时放行', async () => {
    await expect(
      makeGuard([ACCESS_ACTIONS.usersManage], [ACCESS_ACTIONS.usersManage]).canActivate(
        makeContext(user),
      ),
    ).resolves.toBe(true);
  });

  it('用户按钮动作未覆盖接口动作时返回 403', async () => {
    await expect(
      makeGuard([ACCESS_ACTIONS.rolesManage], [ACCESS_ACTIONS.usersManage]).canActivate(
        makeContext(user),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
