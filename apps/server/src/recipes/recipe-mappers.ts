import type { Category, DishDetail, DishSummary } from '@feed-plan/shared';
import type { CategoryRow, DishRow } from '@feed-plan/db';

export function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toDishSummary(row: DishRow, category: CategoryRow | null): DishSummary {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.categoryId,
    category: category ? toCategory(category) : null,
    coverImage: row.coverImage,
    description: row.description,
    referenceUrl: row.referenceUrl,
    difficulty: row.difficulty,
    tags: row.tags,
    dietary: row.dietary,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toDishDetail(args: { dish: DishRow; category: CategoryRow | null }): DishDetail {
  return {
    ...toDishSummary(args.dish, args.category),
    recipeContent: args.dish.recipeContent,
  };
}
