import { ConflictException, NotFoundException } from '@nestjs/common';
import { Column } from 'drizzle-orm';
import { describe, expect, it, vi } from 'vitest';
import type { CategoryRow, DishRow } from '@feed-plan/db';
import type { DishListQuery, JwtPayload } from '@feed-plan/shared';
import { DishesService } from './dishes.service.js';

/** 递归收集 drizzle 条件里引用到的列名 */
function collectColumns(node: unknown, columns = new Set<string>()): Set<string> {
  if (!node || typeof node !== 'object') {
    return columns;
  }

  if (node instanceof Column) {
    columns.add(node.name);
    return columns;
  }

  const chunks = (node as { queryChunks?: unknown[] }).queryChunks;
  if (Array.isArray(chunks)) {
    chunks.forEach((chunk) => collectColumns(chunk, columns));
  }

  return columns;
}

const chef: JwtPayload = {
  sub: '11111111-1111-1111-1111-111111111111',
  username: 'chef',
  roles: [{ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', key: 'chef', name: '主厨', description: null }],
  actions: ['recipes.dishes.manage'],
  menuKeys: [],
  buttonKeys: [],
};
const diner: JwtPayload = {
  ...chef,
  sub: '22222222-2222-2222-2222-222222222222',
  username: 'diner',
  roles: [{ id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', key: 'diner', name: '食客', description: null }],
  actions: [],
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
  tags: ['快手', '下饭'],
  dietary: ['葱'],
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};
describe('DishesService', () => {
  it('diner 访问停用菜谱详情时返回 404，chef 可访问', async () => {
    const service = new DishesService({} as never);
    vi.spyOn(
      service as never as { loadDetail: () => Promise<unknown> },
      'loadDetail',
    ).mockResolvedValue({
      dish: { ...dish, isActive: false },
      categories: [category],
    });
    vi.spyOn(
      service as never as { userCanManageRecipes: (user: JwtPayload) => Promise<boolean> },
      'userCanManageRecipes',
    ).mockImplementation(async (user) => user.sub === chef.sub);

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
      categories: [category],
    });

    await service.update(dish.id, {
      recipeContent: '<p>新的做法</p>',
    });

    expect(db.update).toHaveBeenCalled();
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ recipeContent: '<p>新的做法</p>' }));
  });

  it('keyword 搜索覆盖菜名、描述和菜谱内容三字段', () => {
    const service = new DishesService({} as never);
    const where = (
      service as never as {
        buildListWhere: (query: DishListQuery, canManageRecipes: boolean) => unknown;
      }
    ).buildListWhere({ keyword: '番茄' }, true);

    const columns = collectColumns(where);

    expect(columns).toContain('name');
    expect(columns).toContain('description');
    expect(columns).toContain('recipe_content');
  });

  it('支持按标签与忌口筛选（数组包含）', () => {
    const service = new DishesService({} as never);
    const where = (
      service as never as {
        buildListWhere: (query: DishListQuery, canManageRecipes: boolean) => unknown;
      }
    ).buildListWhere({ tag: '快手', dietary: '香菜' }, true);

    const columns = collectColumns(where);

    expect(columns).toContain('tags');
    expect(columns).toContain('dietary');
  });
});
