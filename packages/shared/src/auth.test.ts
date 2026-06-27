import { describe, expect, it } from 'vitest';

import {
  changePasswordSchema,
  createUserSchema,
  jwtPayloadSchema,
  resetUserPasswordSchema,
  updateUserRolesSchema,
  updateUserSchema,
} from './auth.js';
import { createPermissionSchema, createRoleSchema } from './roles.js';

describe('auth schemas', () => {
  it('validates change password input', () => {
    expect(
      changePasswordSchema.parse({
        currentPassword: 'old-secret',
        newPassword: 'new-secret',
      }),
    ).toEqual({
      currentPassword: 'old-secret',
      newPassword: 'new-secret',
    });

    expect(() =>
      changePasswordSchema.parse({ currentPassword: '', newPassword: 'short' }),
    ).toThrow();
  });

  it('validates reset user password input', () => {
    expect(resetUserPasswordSchema.parse({ password: 'new-secret' })).toEqual({
      password: 'new-secret',
    });
    expect(() => resetUserPasswordSchema.parse({ password: 'short' })).toThrow();
  });

  it('requires at least one role id when creating or updating users', () => {
    const roleId = '11111111-1111-4111-8111-111111111111';
    expect(
      createUserSchema.parse({ username: 'alice', password: 'secret123', roleIds: [roleId] }),
    ).toEqual({ username: 'alice', password: 'secret123', roleIds: [roleId] });
    expect(updateUserRolesSchema.safeParse({ roleIds: [] }).success).toBe(false);
  });

  it('validates user profile updates and only accepts uploaded avatar paths', () => {
    expect(
      updateUserSchema.parse({ username: 'chef', avatar: '/uploads/avatar.webp' }),
    ).toEqual({
      username: 'chef',
      avatar: '/uploads/avatar.webp',
    });

    expect(updateUserSchema.parse({ avatar: null })).toEqual({ avatar: null });
    expect(updateUserSchema.safeParse({ avatar: 'https://example.com/a.webp' }).success).toBe(false);
  });

  it('validates current JWT payload shape and rejects old role-only payloads', () => {
    expect(
      jwtPayloadSchema.safeParse({
        sub: '11111111-1111-4111-8111-111111111111',
        username: 'chef',
        roles: [
          {
            id: '22222222-2222-4222-8222-222222222222',
            key: 'chef',
            name: '主厨',
            description: null,
          },
        ],
        permissions: [
          {
            id: '33333333-3333-4333-8333-333333333333',
            key: 'users.manage',
            name: '用户管理',
            description: null,
          },
        ],
        actions: ['users.manage'],
        menuKeys: ['system.users'],
        buttonKeys: ['system.users.create'],
      }).success,
    ).toBe(true);

    expect(
      jwtPayloadSchema.safeParse({
        sub: '11111111-1111-4111-8111-111111111111',
        username: 'chef',
        role: 'chef',
      }).success,
    ).toBe(false);
  });
});

describe('dynamic RBAC schemas', () => {
  it('validates role and permission keys without fixed role values', () => {
    expect(
      createRoleSchema.parse({
        key: 'kitchen.manager',
        name: '厨房管理员',
        permissionIds: [],
      }),
    ).toEqual({ key: 'kitchen.manager', name: '厨房管理员', permissionIds: [] });
    expect(createRoleSchema.safeParse({ key: 'Chef', name: '主厨' }).success).toBe(false);
    expect(createPermissionSchema.safeParse({ key: 'recipes.manage', name: '菜谱管理' }).success).toBe(
      true,
    );
  });
});
