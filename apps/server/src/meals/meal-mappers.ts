import type { CategoryRow, DishRow, MealRow, OrderRow, UserRow } from '@feed-plan/db';
import type {
  Meal,
  MenuDetail,
  MenuItem,
  MenuItemQuantity,
  OrderWithUser,
} from '@feed-plan/shared';
import { toDishSummary } from '../recipes/recipe-mappers.js';

export function toMeal(row: MealRow): Meal {
  return {
    id: row.id,
    title: row.title,
    mealDate: row.mealDate,
    mealType: row.mealType,
    type: row.type,
    status: row.status,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
    completedAt: row.completedAt,
  };
}

export function toOrderWithUser(
  row: OrderRow,
  user: Pick<UserRow, 'username'> | null,
): OrderWithUser {
  return {
    id: row.id,
    mealId: row.mealId,
    dishId: row.dishId,
    userId: row.userId,
    guestName: row.guestName,
    quantity: row.quantity,
    note: row.note,
    createdAt: row.createdAt,
    username: user?.username ?? null,
  };
}

export function toMenuDetail(args: {
  meal: MealRow;
  rows: Array<{
    order: OrderRow;
    user: Pick<UserRow, 'username'> | null;
    dish: DishRow;
    categories: CategoryRow[];
  }>;
}): MenuDetail {
  const orders = args.rows.map((row) => toOrderWithUser(row.order, row.user));
  const itemMap = new Map<string, MenuItem>();

  for (const row of args.rows) {
    const existing = itemMap.get(row.dish.id);
    const quantity: MenuItemQuantity = {
      userId: row.order.userId,
      username: row.user?.username ?? null,
      guestName: row.order.guestName,
      quantity: row.order.quantity,
    };

    if (existing) {
      existing.totalQuantity += row.order.quantity;
      existing.quantities.push(quantity);
    } else {
      itemMap.set(row.dish.id, {
        dish: toDishSummary(row.dish, row.categories),
        totalQuantity: row.order.quantity,
        quantities: [quantity],
      });
    }
  }

  return {
    meal: toMeal(args.meal),
    orders,
    items: [...itemMap.values()],
  };
}
