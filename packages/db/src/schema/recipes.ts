import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
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
  referenceUrl: varchar('reference_url', { length: 255 }),
  recipeContent: text('recipe_content').notNull().default(''),
  difficulty: varchar('difficulty', { length: 16 })
    .notNull()
    .$type<(typeof DISH_DIFFICULTIES)[number]>(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type CategoryRow = typeof categories.$inferSelect;
export type NewCategoryRow = typeof categories.$inferInsert;
export type DishRow = typeof dishes.$inferSelect;
export type NewDishRow = typeof dishes.$inferInsert;
