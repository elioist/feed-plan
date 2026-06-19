import { z } from 'zod';

export const DISH_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type DishDifficulty = (typeof DISH_DIFFICULTIES)[number];

export const dishDifficultySchema = z.enum(DISH_DIFFICULTIES);

/** 常见忌口建议项（前端下拉建议，非枚举约束） */
export const COMMON_DIETARY = [
  '香菜',
  '葱',
  '蒜',
  '姜',
  '折耳根',
  '辣椒',
  '香菇',
  '芹菜',
  '内脏',
] as const;

/** 标签 / 忌口通用列表：去空白、单项 1-32 字、最多 20 个 */
const tagListSchema = z.array(z.string().trim().min(1).max(32)).max(20).default([]);

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
export type IdParam = z.infer<typeof idParamSchema>;

const optionalText = z.string().trim().max(1000).optional().nullable();
const optionalImagePath = z.string().trim().max(255).optional().nullable();
const optionalUrl = z.string().trim().max(255).optional().nullable();
const queryBooleanSchema = z.preprocess((value) => {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return value;
}, z.boolean());

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

export const createDishSchema = z.object({
  name: z.string().trim().min(1, '菜谱名称不能为空').max(128),
  categoryId: z.string().uuid('分类 id 不合法'),
  coverImage: optionalImagePath,
  description: optionalText,
  referenceUrl: optionalUrl,
  recipeContent: z.string().trim().min(1, '菜谱内容不能为空').max(20000),
  difficulty: dishDifficultySchema,
  tags: tagListSchema,
  dietary: tagListSchema,
  isActive: z.boolean().default(true),
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
  tag: z.string().trim().min(1).max(32).optional(),
  dietary: z.string().trim().min(1).max(32).optional(),
  isActive: queryBooleanSchema.optional(),
});
export type DishListQuery = z.infer<typeof dishListQuerySchema>;

export const dishSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  categoryId: z.string().uuid().nullable(),
  category: categorySchema.nullable(),
  coverImage: z.string().nullable(),
  description: z.string().nullable(),
  referenceUrl: z.string().nullable(),
  difficulty: dishDifficultySchema,
  tags: z.array(z.string()),
  dietary: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type DishSummary = z.infer<typeof dishSummarySchema>;

export const dishDetailSchema = dishSummarySchema.extend({
  recipeContent: z.string(),
});
export type DishDetail = z.infer<typeof dishDetailSchema>;
