import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { UserRow } from '@feed-plan/db';
import { UsersService } from './users.service.js';

const chefId = '11111111-1111-1111-1111-111111111111';
const dinerRow: UserRow = {
  id: '22222222-2222-2222-2222-222222222222',
  username: 'diner',
  passwordHash: 'hashed',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};
const roleId = '33333333-3333-4333-8333-333333333333';
const access = {
  getUserRoles: vi.fn().mockResolvedValue([{ id: roleId, key: 'diner', name: '食客', description: null }]),
  getUserPermissions: vi.fn().mockResolvedValue([]),
  getUserActions: vi.fn().mockResolvedValue([]),
  getUserMenuKeys: vi.fn().mockResolvedValue([]),
  getUserButtonKeys: vi.fn().mockResolvedValue([]),
  assertRolesExist: vi.fn().mockResolvedValue(undefined),
  roleIdsKeepManagementAccess: vi.fn().mockResolvedValue(false),
};

describe('UsersService（管理方法）', () => {
  it('list 返回的用户不含密码哈希', async () => {
    const orderBy = vi.fn(async () => [dinerRow]);
    const db = {
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({ orderBy })),
        })),
      })),
    };
    const service = new UsersService(db as never, access as never);

    const result = await service.list();

    expect(result).toEqual([
      {
        id: dinerRow.id,
        username: 'diner',
        roles: [{ id: roleId, key: 'diner', name: '食客', description: null }],
        permissions: [],
        actions: [],
        menuKeys: [],
        buttonKeys: [],
        createdAt: dinerRow.createdAt,
      },
    ]);
    expect(result[0]).not.toHaveProperty('passwordHash');
  });

  it('updateRoles 禁止移除自己的最后管理权限', async () => {
    const service = new UsersService({} as never, access as never);
    vi.spyOn(service as never as { assertUserExists: (id: string) => Promise<void> }, 'assertUserExists').mockResolvedValue(undefined);
    await expect(service.updateRoles(chefId, { roleIds: [roleId] }, chefId)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('remove 禁止删除自己', async () => {
    const service = new UsersService({} as never, access as never);
    await expect(service.remove(chefId, chefId)).rejects.toBeInstanceOf(ConflictException);
  });

  it('create 用户名冲突时返回 409', async () => {
    const returning = vi.fn(async () => {
      throw { code: '23505' };
    });
    const db = { insert: vi.fn(() => ({ values: vi.fn(() => ({ returning })) })) };
    const service = new UsersService(db as never, access as never);

    await expect(
      service.create({ username: 'diner', password: 'secret123', roleIds: [roleId] }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('changePassword 旧密码错误时返回 401', async () => {
    const service = new UsersService({} as never, access as never);
    vi.spyOn(service, 'findById').mockResolvedValue(dinerRow);
    vi.spyOn(service, 'verifyPassword').mockResolvedValue(false);

    await expect(
      service.changePassword(dinerRow.id, {
        currentPassword: 'wrong',
        newPassword: 'secret123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('changePassword 用户不存在时返回 404', async () => {
    const service = new UsersService({} as never, access as never);
    vi.spyOn(service, 'findById').mockResolvedValue(null);

    await expect(
      service.changePassword(dinerRow.id, {
        currentPassword: 'old-secret',
        newPassword: 'secret123',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('resetPassword 禁止通过管理接口重置自己', async () => {
    const service = new UsersService({} as never, access as never);

    await expect(service.resetPassword(chefId, 'secret123', chefId)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('resetPassword 目标用户不存在时返回 404', async () => {
    const limit = vi.fn(async () => []);
    const db = {
      select: vi.fn(() => ({
        from: vi.fn(() => ({ where: vi.fn(() => ({ limit })) })),
      })),
    };
    const service = new UsersService(db as never, access as never);

    await expect(service.resetPassword(dinerRow.id, 'secret123', chefId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
