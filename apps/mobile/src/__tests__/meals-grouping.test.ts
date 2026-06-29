import { describe, it, expect } from 'vitest';
import type { DishSummary, Category } from '@feed-plan/shared';

const mockCategories: Category[] = [
  { id: 'cat-1', name: '推荐', sortOrder: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-2', name: '荤菜', sortOrder: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-3', name: '素菜', sortOrder: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-4', name: '汤', sortOrder: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-5', name: '甜品', sortOrder: 4, createdAt: new Date(), updatedAt: new Date() },
];

const mockDishes: DishSummary[] = [
  {
    id: 'd1', name: '测试菜',
    categories: [mockCategories[0]],
    coverImage: null, description: null, referenceUrl: null, difficulty: 'easy',
    tags: [], dietary: [], isActive: true, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: 'd2', name: '锅包肉',
    categories: [mockCategories[1]],
    coverImage: null, description: null, referenceUrl: null, difficulty: 'medium',
    tags: [], dietary: [], isActive: true, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: 'd3', name: '番茄炒蛋',
    categories: [mockCategories[2]],
    coverImage: null, description: null, referenceUrl: null, difficulty: 'easy',
    tags: [], dietary: [], isActive: true, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: 'd4', name: '番茄鸡蛋汤',
    categories: [mockCategories[3]],
    coverImage: null, description: null, referenceUrl: null, difficulty: 'easy',
    tags: [], dietary: [], isActive: true, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: 'd5', name: '蓝莓山药',
    categories: [mockCategories[4]],
    coverImage: null, description: null, referenceUrl: null, difficulty: 'easy',
    tags: [], dietary: [], isActive: true, createdAt: new Date(), updatedAt: new Date(),
  },
];

// 这是 meals.tsx 中的分组逻辑
function groupDishesByCategory(categories: Category[], dishes: DishSummary[]) {
  return categories.map((cat) => ({
    category: cat,
    dishes: dishes.filter((d) => {
      const inCat = d.categories.some((c) => c.id === cat.id);
      return inCat;
    }),
  })).filter((g) => g.dishes.length > 0);
}

describe('菜品分组逻辑', () => {
  it('蓝莓山药应该在甜品类别下', () => {
    const grouped = groupDishesByCategory(mockCategories, mockDishes);

    const dessertGroup = grouped.find((g) => g.category.name === '甜品');
    const soupGroup = grouped.find((g) => g.category.name === '汤');

    expect(dessertGroup).toBeDefined();
    expect(dessertGroup!.dishes.map((d) => d.name)).toContain('蓝莓山药');
    expect(soupGroup!.dishes.map((d) => d.name)).not.toContain('蓝莓山药');
  });

  it('每个分类应该只包含属于该分类的菜品', () => {
    const grouped = groupDishesByCategory(mockCategories, mockDishes);

    expect(grouped.find((g) => g.category.name === '推荐')!.dishes.map((d) => d.name)).toEqual(['测试菜']);
    expect(grouped.find((g) => g.category.name === '荤菜')!.dishes.map((d) => d.name)).toEqual(['锅包肉']);
    expect(grouped.find((g) => g.category.name === '素菜')!.dishes.map((d) => d.name)).toEqual(['番茄炒蛋']);
    expect(grouped.find((g) => g.category.name === '汤')!.dishes.map((d) => d.name)).toEqual(['番茄鸡蛋汤']);
    expect(grouped.find((g) => g.category.name === '甜品')!.dishes.map((d) => d.name)).toEqual(['蓝莓山药']);
  });
});
