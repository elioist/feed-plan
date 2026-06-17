import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { CategoryRow } from '@feed-plan/db';
import { CategoriesService } from './categories.service.js';

const category: CategoryRow = {
  id: '11111111-1111-1111-1111-111111111111',
  name: '家常菜',
  sortOrder: 1,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

function selectQueue(results: unknown[][]) {
  return vi.fn(() => ({
    from: vi.fn(() => ({
      orderBy: vi.fn(async () => results.shift()),
      where: vi.fn(() => ({
        limit: vi.fn(async () => results.shift()),
      })),
    })),
  }));
}

describe('CategoriesService', () => {
  it('按数据库排序结果返回分类列表', async () => {
    const db = { select: selectQueue([[category]]) };
    const service = new CategoriesService(db as never);

    await expect(service.list()).resolves.toEqual([
      {
        id: category.id,
        name: category.name,
        sortOrder: category.sortOrder,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    ]);
  });

  it('创建分类并返回外部字段', async () => {
    const returning = vi.fn(async () => [category]);
    const db = {
      insert: vi.fn(() => ({
        values: vi.fn(() => ({ returning })),
      })),
    };
    const service = new CategoriesService(db as never);

    await expect(service.create({ name: '家常菜', sortOrder: 1 })).resolves.toMatchObject({
      id: category.id,
      name: '家常菜',
      sortOrder: 1,
    });
  });

  it('更新分类时写入 updatedAt', async () => {
    const set = vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(async () => [category]),
      })),
    }));
    const db = {
      update: vi.fn(() => ({ set })),
    };
    const service = new CategoriesService(db as never);

    await service.update(category.id, { name: '快手菜' });

    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({ name: '快手菜', updatedAt: expect.any(Date) }),
    );
  });

  it('删除被菜谱引用的分类时返回 409', async () => {
    const db = {
      select: selectQueue([[category], [{ id: 'dish-id' }]]),
    };
    const service = new CategoriesService(db as never);

    await expect(service.remove(category.id)).rejects.toBeInstanceOf(ConflictException);
  });
});
