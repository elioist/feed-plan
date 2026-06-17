import type { Category, DishDetail, DishSummary, Ingredient, RecipeStep } from '@feed-plan/shared';
import type { CategoryRow, DishRow, IngredientRow, RecipeStepRow } from '@feed-plan/db';

export function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toIngredient(row: IngredientRow): Ingredient {
  return {
    id: row.id,
    dishId: row.dishId,
    name: row.name,
    amount: row.amount,
    sortOrder: row.sortOrder,
  };
}

export function toRecipeStep(row: RecipeStepRow): RecipeStep {
  return {
    id: row.id,
    dishId: row.dishId,
    stepNo: row.stepNo,
    content: row.content,
    image: row.image,
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
    biliVideo: row.biliVideo,
    difficulty: row.difficulty,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toDishDetail(args: {
  dish: DishRow;
  category: CategoryRow | null;
  ingredients: IngredientRow[];
  steps: RecipeStepRow[];
}): DishDetail {
  return {
    ...toDishSummary(args.dish, args.category),
    ingredients: args.ingredients.map(toIngredient),
    steps: args.steps.map(toRecipeStep),
  };
}
