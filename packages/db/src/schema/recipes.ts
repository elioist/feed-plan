import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { DISH_DIFFICULTIES } from '@feed-plan/shared';

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 64 }).notNull().unique(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const dishes = pgTable('dishes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 128 }).notNull(),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'restrict' }),
  coverImage: varchar('cover_image', { length: 255 }),
  description: text('description'),
  biliVideo: varchar('bili_video', { length: 255 }),
  difficulty: varchar('difficulty', { length: 16 })
    .notNull()
    .$type<(typeof DISH_DIFFICULTIES)[number]>(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const ingredients = pgTable('ingredients', {
  id: uuid('id').defaultRandom().primaryKey(),
  dishId: uuid('dish_id')
    .notNull()
    .references(() => dishes.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 64 }).notNull(),
  amount: varchar('amount', { length: 64 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const recipeSteps = pgTable(
  'recipe_steps',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    dishId: uuid('dish_id')
      .notNull()
      .references(() => dishes.id, { onDelete: 'cascade' }),
    stepNo: integer('step_no').notNull(),
    content: text('content').notNull(),
    image: varchar('image', { length: 255 }),
  },
  (table) => ({
    dishStepNoUnique: uniqueIndex('recipe_steps_dish_id_step_no_unique').on(
      table.dishId,
      table.stepNo,
    ),
  }),
);

export type CategoryRow = typeof categories.$inferSelect;
export type NewCategoryRow = typeof categories.$inferInsert;
export type DishRow = typeof dishes.$inferSelect;
export type NewDishRow = typeof dishes.$inferInsert;
export type IngredientRow = typeof ingredients.$inferSelect;
export type NewIngredientRow = typeof ingredients.$inferInsert;
export type RecipeStepRow = typeof recipeSteps.$inferSelect;
export type NewRecipeStepRow = typeof recipeSteps.$inferInsert;
