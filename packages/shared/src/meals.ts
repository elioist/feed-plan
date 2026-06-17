import { z } from 'zod';
import { dishSummarySchema } from './recipes.js';

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const MEAL_KINDS = ['daily', 'gathering'] as const;
export type MealKind = (typeof MEAL_KINDS)[number];

export const MEAL_STATUSES = ['ordering', 'completed'] as const;
export type MealStatus = (typeof MEAL_STATUSES)[number];

export const mealTypeSchema = z.enum(MEAL_TYPES);
export const mealKindSchema = z.enum(MEAL_KINDS);
export const mealStatusSchema = z.enum(MEAL_STATUSES);

export const mealDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为 YYYY-MM-DD');

export const currentMealInputSchema = z.object({
  mealDate: mealDateSchema,
  mealType: mealTypeSchema,
  title: z.string().trim().min(1).max(128).optional(),
  type: mealKindSchema.default('daily'),
});
export type CurrentMealInput = z.infer<typeof currentMealInputSchema>;

export const addOrderInputSchema = z.object({
  dishId: z.string().uuid(),
  quantity: z.number().int().min(1, '数量必须大于 0').default(1),
  note: z.string().trim().max(500).optional().nullable(),
});
export type AddOrderInput = z.infer<typeof addOrderInputSchema>;

export const mealQuerySchema = z.object({
  mealDate: mealDateSchema.optional(),
  mealType: mealTypeSchema.optional(),
  status: mealStatusSchema.optional(),
});
export type MealQuery = z.infer<typeof mealQuerySchema>;

export const mealSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  mealDate: mealDateSchema,
  mealType: mealTypeSchema,
  type: mealKindSchema,
  status: mealStatusSchema,
  createdBy: z.string().uuid(),
  createdAt: z.coerce.date(),
  completedAt: z.coerce.date().nullable(),
});
export type Meal = z.infer<typeof mealSchema>;

export const orderSchema = z.object({
  id: z.string().uuid(),
  mealId: z.string().uuid(),
  dishId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  guestName: z.string().nullable(),
  quantity: z.number().int(),
  note: z.string().nullable(),
  createdAt: z.coerce.date(),
});
export type Order = z.infer<typeof orderSchema>;

export const orderWithUserSchema = orderSchema.extend({
  username: z.string().nullable(),
});
export type OrderWithUser = z.infer<typeof orderWithUserSchema>;

export const menuItemQuantitySchema = z.object({
  userId: z.string().uuid().nullable(),
  username: z.string().nullable(),
  guestName: z.string().nullable(),
  quantity: z.number().int(),
});
export type MenuItemQuantity = z.infer<typeof menuItemQuantitySchema>;

export const menuItemSchema = z.object({
  dish: dishSummarySchema,
  totalQuantity: z.number().int(),
  quantities: z.array(menuItemQuantitySchema),
});
export type MenuItem = z.infer<typeof menuItemSchema>;

export const menuDetailSchema = z.object({
  meal: mealSchema,
  orders: z.array(orderWithUserSchema),
  items: z.array(menuItemSchema),
});
export type MenuDetail = z.infer<typeof menuDetailSchema>;
