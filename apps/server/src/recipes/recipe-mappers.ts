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

export function toDishSummary(
  row: DishRow,
  categories: CategoryRow[] = [],
): DishSummary {
  return {
    id: row.id,
    name: row.name,
    categories: categories.map(toCategory),
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

export function toDishDetail(args: {
  dish: DishRow;
  categories: CategoryRow[];
}): DishDetail {
  return {
    ...toDishSummary(args.dish, args.categories),
    recipeContent: args.dish.recipeContent,
  };
}
