import { ConflictException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { CategoryRow, DishRow, MealRow, OrderRow } from '@feed-plan/db';
import type { JwtPayload } from '@feed-plan/shared';
import { MealsService } from './meals.service.js';

const chef: JwtPayload = {
  sub: '11111111-1111-1111-1111-111111111111',
  username: 'chef',
  roles: [{ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', key: 'chef', name: '主厨', description: null }],
  actions: [],
  menuKeys: [],
  buttonKeys: [],
};
const meal: MealRow = {
  id: '22222222-2222-2222-2222-222222222222',
  title: '2026-06-17 dinner',
  mealDate: '2026-06-17',
  mealType: 'dinner',
  type: 'daily',
  status: 'ordering',
  createdBy: chef.sub,
  createdAt: new Date('2026-06-17T10:00:00.000Z'),
  completedAt: null,
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
  recipeContent: '<p>番茄和鸡蛋炒熟</p>',
  difficulty: 'easy',
  tags: [],
  dietary: [],
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};
const order: OrderRow = {
  id: '55555555-5555-5555-5555-555555555555',
  mealId: meal.id,
  dishId: dish.id,
  userId: chef.sub,
  guestName: null,
  quantity: 2,
  note: null,
  createdAt: new Date('2026-06-17T10:01:00.000Z'),
};

describe('MealsService', () => {
  it('当前 ordering 存在时直接返回详情，不重复创建', async () => {
    const service = new MealsService({} as never);
    vi.spyOn(
      service as never as { findOrderingMeal: () => Promise<MealRow | null> },
      'findOrderingMeal',
    ).mockResolvedValue(meal);
    const getDetail = vi
      .spyOn(service, 'getDetail')
      .mockResolvedValue({ meal: { ...meal }, orders: [], items: [] });

    await service.getOrCreateCurrent(
      { mealDate: '2026-06-17', mealType: 'dinner', type: 'daily' },
      chef,
    );

    expect(getDetail).toHaveBeenCalledWith(meal.id);
  });

  it('完成 completed meal 时返回 409', async () => {
    const service = new MealsService({} as never);
    vi.spyOn(
      service as never as { findMealById: () => Promise<MealRow> },
      'findMealById',
    ).mockResolvedValue({ ...meal, status: 'completed' });

    await expect(service.complete(meal.id)).rejects.toBeInstanceOf(ConflictException);
  });

  it('加菜到 completed meal 时返回 409', async () => {
    const service = new MealsService({} as never);
    vi.spyOn(
      service as never as { findMealById: () => Promise<MealRow> },
      'findMealById',
    ).mockResolvedValue({ ...meal, status: 'completed' });

    await expect(
      service.addOrder(meal.id, { dishId: dish.id, quantity: 1 }, chef),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('停用菜谱加菜返回 404', async () => {
    const service = new MealsService({} as never);
    vi.spyOn(
      service as never as { findMealById: () => Promise<MealRow> },
      'findMealById',
    ).mockResolvedValue(meal);
    vi.spyOn(
      service as never as { assertActiveDish: () => Promise<void> },
      'assertActiveDish',
    ).mockRejectedValue(new NotFoundException('菜谱不存在或已停用'));

    await expect(
      service.addOrder(meal.id, { dishId: dish.id, quantity: 1 }, chef),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('菜单详情按菜品聚合数量并保留订单明细', async () => {
    const db = {
      select: vi
        .fn()
        .mockReturnValueOnce({
          from: vi.fn(() => ({
            where: vi.fn(() => ({ limit: vi.fn(async () => [meal]) })),
          })),
        })
        .mockReturnValueOnce({
          from: vi.fn(() => ({
            leftJoin: vi.fn(() => ({
              innerJoin: vi.fn(() => ({
                where: vi.fn(() => ({
                  orderBy: vi.fn(async () => [
                    {
                      order,
                      user: { username: 'chef' },
                      dish,
                    },
                  ]),
                })),
              })),
            })),
          })),
        })
        .mockReturnValueOnce({
          from: vi.fn(() => ({
            innerJoin: vi.fn(() => ({
              where: vi.fn(async () => [{ dishId: dish.id, category }]),
            })),
          })),
        }),
    };
    const service = new MealsService(db as never);

    const detail = await service.getDetail(meal.id);

    expect(detail.orders).toHaveLength(1);
    expect(detail.items).toHaveLength(1);
    expect(detail.items[0]?.totalQuantity).toBe(2);
    expect(detail.items[0]?.quantities[0]).toMatchObject({ username: 'chef', quantity: 2 });
  });
});
