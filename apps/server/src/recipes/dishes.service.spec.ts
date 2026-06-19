import { ConflictException, NotFoundException } from '@nestjs/common';
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
  referenceUrl: null,
  recipeContent: '<h3>食材</h3><p>鸡蛋、番茄</p><h3>做法</h3><p>炒熟</p>',
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
  referenceUrl: null,
  recipeContent: dish.recipeContent,
  difficulty: 'easy',
  isActive: true,
  createdAt: dish.createdAt,
  updatedAt: dish.updatedAt,
};

describe('DishesService', () => {
  it('diner 访问停用菜谱详情时返回 404，chef 可访问', async () => {
    const service = new DishesService({} as never);
    vi.spyOn(
      service as never as { loadDetail: () => Promise<unknown> },
      'loadDetail',
    ).mockResolvedValue({
      dish: { ...dish, isActive: false },
      category,
    });

    await expect(service.getById(dish.id, diner)).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.getById(dish.id, chef)).resolves.toMatchObject({
      id: dish.id,
      isActive: false,
    });
  });

  it('remove 删除未被引用的菜谱', async () => {
    const where = vi.fn(async () => undefined);
    const db = {
      delete: vi.fn(() => ({ where })),
    };
    const service = new DishesService({} as never);
    Object.assign(service, { db });
    vi.spyOn(
      service as never as { assertDishExists: () => Promise<void> },
      'assertDishExists',
    ).mockResolvedValue(undefined);

    await service.remove(dish.id);

    expect(db.delete).toHaveBeenCalled();
    expect(where).toHaveBeenCalled();
  });

  it('remove 遇到订单引用时返回 409', async () => {
    const where = vi.fn(async () => {
      throw { code: '23503' };
    });
    const db = {
      delete: vi.fn(() => ({ where })),
    };
    const service = new DishesService({} as never);
    Object.assign(service, { db });
    vi.spyOn(
      service as never as { assertDishExists: () => Promise<void> },
      'assertDishExists',
    ).mockResolvedValue(undefined);

    await expect(service.remove(dish.id)).rejects.toBeInstanceOf(ConflictException);
  });

  it('更新菜谱时只更新菜谱主表字段', async () => {
    const set = vi.fn(() => ({ where: vi.fn(async () => undefined) }));
    const db = {
      update: vi.fn(() => ({ set })),
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
    });

    await service.update(dish.id, {
      recipeContent: '<p>新的做法</p>',
    });

    expect(db.update).toHaveBeenCalled();
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ recipeContent: '<p>新的做法</p>' }));
  });
});
