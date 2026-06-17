import { z } from 'zod';

export const DISH_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type DishDifficulty = (typeof DISH_DIFFICULTIES)[number];

export const dishDifficultySchema = z.enum(DISH_DIFFICULTIES);

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
export type IdParam = z.infer<typeof idParamSchema>;

const optionalText = z.string().trim().max(1000).optional().nullable();
const optionalImagePath = z.string().trim().max(255).optional().nullable();

export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Category = z.infer<typeof categorySchema>;

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, '分类名称不能为空').max(64),
  sortOrder: z.number().int().min(0).default(0),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial().refine((value) => {
  return value.name !== undefined || value.sortOrder !== undefined;
}, '至少提供一个要更新的字段');
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const ingredientInputSchema = z.object({
  name: z.string().trim().min(1, '食材名称不能为空').max(64),
  amount: z.string().trim().min(1, '食材用量不能为空').max(64),
  sortOrder: z.number().int().min(0).optional(),
});
export type IngredientInput = z.infer<typeof ingredientInputSchema>;

export const recipeStepInputSchema = z.object({
  stepNo: z.number().int().min(1, '步骤编号必须大于 0'),
  content: z.string().trim().min(1, '步骤内容不能为空').max(2000),
  image: optionalImagePath,
});
export type RecipeStepInput = z.infer<typeof recipeStepInputSchema>;

export const createDishSchema = z.object({
  name: z.string().trim().min(1, '菜谱名称不能为空').max(128),
  categoryId: z.string().uuid('分类 id 不合法'),
  coverImage: optionalImagePath,
  description: optionalText,
  biliVideo: z.string().trim().max(255).optional().nullable(),
  difficulty: dishDifficultySchema,
  isActive: z.boolean().default(true),
  ingredients: z.array(ingredientInputSchema).default([]),
  steps: z.array(recipeStepInputSchema).default([]),
});
export type CreateDishInput = z.infer<typeof createDishSchema>;

export const updateDishSchema = createDishSchema.partial().refine((value) => {
  return Object.keys(value).length > 0;
}, '至少提供一个要更新的字段');
export type UpdateDishInput = z.infer<typeof updateDishSchema>;

export const updateDishActiveSchema = z.object({
  isActive: z.boolean(),
});
export type UpdateDishActiveInput = z.infer<typeof updateDishActiveSchema>;

export const dishListQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
  keyword: z.string().trim().min(1).max(64).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});
export type DishListQuery = z.infer<typeof dishListQuerySchema>;

export const ingredientSchema = z.object({
  id: z.string().uuid(),
  dishId: z.string().uuid(),
  name: z.string(),
  amount: z.string(),
  sortOrder: z.number().int(),
});
export type Ingredient = z.infer<typeof ingredientSchema>;

export const recipeStepSchema = z.object({
  id: z.string().uuid(),
  dishId: z.string().uuid(),
  stepNo: z.number().int(),
  content: z.string(),
  image: z.string().nullable(),
});
export type RecipeStep = z.infer<typeof recipeStepSchema>;

export const dishSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  categoryId: z.string().uuid(),
  category: categorySchema.nullable(),
  coverImage: z.string().nullable(),
  description: z.string().nullable(),
  biliVideo: z.string().nullable(),
  difficulty: dishDifficultySchema,
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type DishSummary = z.infer<typeof dishSummarySchema>;

export const dishDetailSchema = dishSummarySchema.extend({
  ingredients: z.array(ingredientSchema),
  steps: z.array(recipeStepSchema),
});
export type DishDetail = z.infer<typeof dishDetailSchema>;
