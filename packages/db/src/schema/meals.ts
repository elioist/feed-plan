import {
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { MEAL_KINDS, MEAL_STATUSES, MEAL_TYPES } from '@feed-plan/shared';
import { dishes } from './recipes.js';
import { users } from './users.js';

export const meals = pgTable(
  'meals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 128 }).notNull(),
    mealDate: date('meal_date', { mode: 'string' }).notNull(),
    mealType: varchar('meal_type', { length: 16 }).notNull().$type<(typeof MEAL_TYPES)[number]>(),
    type: varchar('type', { length: 16 })
      .notNull()
      .default('daily')
      .$type<(typeof MEAL_KINDS)[number]>(),
    status: varchar('status', { length: 16 })
      .notNull()
      .default('ordering')
      .$type<(typeof MEAL_STATUSES)[number]>(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => ({
    orderingMealUnique: uniqueIndex('meals_ordering_date_type_unique')
      .on(table.mealDate, table.mealType)
      .where(sql`${table.status} = 'ordering'`),
  }),
);

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    mealId: uuid('meal_id')
      .notNull()
      .references(() => meals.id, { onDelete: 'cascade' }),
    dishId: uuid('dish_id')
      .notNull()
      .references(() => dishes.id, { onDelete: 'restrict' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    guestName: varchar('guest_name', { length: 64 }),
    quantity: integer('quantity').notNull().default(1),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userDishMealUnique: uniqueIndex('orders_meal_dish_user_unique').on(
      table.mealId,
      table.dishId,
      table.userId,
    ),
  }),
);

export type MealRow = typeof meals.$inferSelect;
export type NewMealRow = typeof meals.$inferInsert;
export type OrderRow = typeof orders.$inferSelect;
export type NewOrderRow = typeof orders.$inferInsert;
