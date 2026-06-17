import { describe, it, expect } from 'vitest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { JwtPayload, Role } from '@feed-plan/shared';
import { RolesGuard } from './roles.guard.js';
import { ROLES_KEY } from './roles.decorator.js';

function makeContext(user: JwtPayload | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

function makeGuard(required: Role[] | undefined) {
  const reflector = {
    getAllAndOverride: () => required,
  } as unknown as Reflector;
  return new RolesGuard(reflector);
}

const chef: JwtPayload = { sub: 'c', username: 'chef', role: 'chef' };
const diner: JwtPayload = { sub: 'd', username: 'diner', role: 'diner' };

describe('RolesGuard', () => {
  it('主厨访问仅主厨接口 → 放行', () => {
    expect(makeGuard(['chef']).canActivate(makeContext(chef))).toBe(true);
  });

  it('食客访问仅主厨接口 → 403', () => {
    expect(() => makeGuard(['chef']).canActivate(makeContext(diner))).toThrow(ForbiddenException);
  });

  it('未标注 @Roles 的接口 → 任意登录用户放行', () => {
    expect(makeGuard(undefined).canActivate(makeContext(diner))).toBe(true);
  });

  it('未登录（无 user）访问受限接口 → 403', () => {
    expect(() => makeGuard(['chef']).canActivate(makeContext(undefined))).toThrow(
      ForbiddenException,
    );
  });

  it('ROLES_KEY 元数据键稳定', () => {
    expect(ROLES_KEY).toBe('roles');
  });
});
