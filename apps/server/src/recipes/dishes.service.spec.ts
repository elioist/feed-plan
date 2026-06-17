import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { CategoryRow, DishRow } from '@feed-plan/db';
import type { DishDetail, JwtPayload } from '@feed-plan/shared';
import { DishesService } from './dishes.service.js';

const chef: JwtPayload = {
  sub: '11111111-1111-1111-1111-111111111111',
  username: 'chef',
  role: 'chef',
};
const diner: JwtPayload = {
  ...chef,
  sub: '22222222-2222-2222-2222-222222222222',
  username: 'diner',
  role: 'diner',
};
const category: CategoryRow = {
  id: '33333333-3333-3333-3333-333333333333',
  name: '家常菜',
  sortOrder: 1,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};
const dish: DishRow = {
  id: '44444444-4444-4444-4444-444444444444',
  name: '番茄炒蛋',
  categoryId: category.id,
  coverImage: null,
  description: '下饭',
  biliVideo: null,
  difficulty: 'easy',
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};
const detail: DishDetail = {
  id: dish.id,
  name: dish.name,
  categoryId: category.id,
  category: {
    id: category.id,
    name: category.name,
    sortOrder: category.sortOrder,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  },
  coverImage: null,
  description: '下饭',
  biliVideo: null,
  difficulty: 'easy',
  isActive: true,
  createdAt: dish.createdAt,
  updatedAt: dish.updatedAt,
  ingredients: [],
  steps: [],
};

describe('DishesService', () => {
  it('重复 stepNo 时拒绝创建，避免部分写入', async () => {
    const service = new DishesService({} as never);

    await expect(
      service.create({
        name: '番茄炒蛋',
        categoryId: category.id,
        difficulty: 'easy',
        isActive: true,
        ingredients: [],
        steps: [
          { stepNo: 1, content: '切番茄' },
          { stepNo: 1, content: '炒鸡蛋' },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('diner 访问停用菜谱详情时返回 404，chef 可访问', async () => {
    const service = new DishesService({} as never);
    vi.spyOn(
      service as never as { loadDetail: () => Promise<unknown> },
      'loadDetail',
    ).mockResolvedValue({
      dish: { ...dish, isActive: false },
      category,
      ingredients: [],
      steps: [],
    });

    await expect(service.getById(dish.id, diner)).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.getById(dish.id, chef)).resolves.toMatchObject({
      id: dish.id,
      isActive: false,
    });
  });

  it('softDelete 委托 setActive(false)', async () => {
    const service = new DishesService({} as never);
    const setActive = vi
      .spyOn(service, 'setActive')
      .mockResolvedValue({ ...detail, isActive: false });

    await service.softDelete(dish.id);

    expect(setActive).toHaveBeenCalledWith(dish.id, { isActive: false });
  });

  it('更新菜谱时在事务中整体替换食材与步骤', async () => {
    const deleteCalls: unknown[] = [];
    const insertCalls: unknown[] = [];
    const tx = {
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(async () => undefined),
        })),
      })),
      delete: vi.fn((table) => {
        deleteCalls.push(table);
        return { where: vi.fn(async () => undefined) };
      }),
      insert: vi.fn((table) => {
        insertCalls.push(table);
        return { values: vi.fn(async () => undefined) };
      }),
    };
    const db = {
      transaction: vi.fn(async (callback) => callback(tx)),
    };
    const service = new DishesService(db as never);
    vi.spyOn(
      service as never as { assertDishExists: () => Promise<void> },
      'assertDishExists',
    ).mockResolvedValue(undefined);
    vi.spyOn(
      service as never as { loadDetail: () => Promise<unknown> },
      'loadDetail',
    ).mockResolvedValue({
      dish,
      category,
      ingredients: [],
      steps: [],
    });

    await service.update(dish.id, {
      ingredients: [{ name: '鸡蛋', amount: '2 个' }],
      steps: [{ stepNo: 1, content: '炒熟' }],
    });

    expect(deleteCalls).toHaveLength(2);
    expect(insertCalls).toHaveLength(2);
  });
});
