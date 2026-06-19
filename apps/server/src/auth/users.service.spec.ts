import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { UserRow } from '@feed-plan/db';
import { UsersService } from './users.service.js';

const chefId = '11111111-1111-1111-1111-111111111111';
const dinerRow: UserRow = {
  id: '22222222-2222-2222-2222-222222222222',
  username: 'diner',
  passwordHash: 'hashed',
  role: 'diner',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('UsersService（管理方法）', () => {
  it('list 返回的用户不含密码哈希', async () => {
    const orderBy = vi.fn(async () => [dinerRow]);
    const db = { select: vi.fn(() => ({ from: vi.fn(() => ({ orderBy })) })) };
    const service = new UsersService(db as never);

    const result = await service.list();

    expect(result).toEqual([
      { id: dinerRow.id, username: 'diner', role: 'diner', createdAt: dinerRow.createdAt },
    ]);
    expect(result[0]).not.toHaveProperty('passwordHash');
  });

  it('updateRole 禁止修改自己的角色', async () => {
    const service = new UsersService({} as never);
    await expect(service.updateRole(chefId, 'diner', chefId)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('remove 禁止删除自己', async () => {
    const service = new UsersService({} as never);
    await expect(service.remove(chefId, chefId)).rejects.toBeInstanceOf(ConflictException);
  });

  it('create 用户名冲突时返回 409', async () => {
    const returning = vi.fn(async () => {
      throw { code: '23505' };
    });
    const db = { insert: vi.fn(() => ({ values: vi.fn(() => ({ returning })) })) };
    const service = new UsersService(db as never);

    await expect(
      service.create({ username: 'diner', password: 'secret123', role: 'diner' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
