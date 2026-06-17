import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { categories, dishes, meals, orders, users, type MealRow } from '@feed-plan/db';
import type {
  AddOrderInput,
  CurrentMealInput,
  JwtPayload,
  MealQuery,
  MenuDetail,
} from '@feed-plan/shared';
import { DRIZZLE, type DrizzleDb } from '../drizzle/drizzle.constants.js';
import { toMenuDetail } from './meal-mappers.js';

@Injectable()
export class MealsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async getOrCreateCurrent(input: CurrentMealInput, user: JwtPayload): Promise<MenuDetail> {
    const existing = await this.findOrderingMeal(input.mealDate, input.mealType);
    if (existing) {
      return this.getDetail(existing.id);
    }

    const [created] = await this.db
      .insert(meals)
      .values({
        title: input.title ?? this.defaultTitle(input.mealDate, input.mealType),
        mealDate: input.mealDate,
        mealType: input.mealType,
        type: input.type,
        status: 'ordering',
        createdBy: user.sub,
      })
      .returning();

    if (!created) {
      throw new ConflictException('当前餐次创建失败');
    }
    return this.getDetail(created.id);
  }

  async list(query: MealQuery): Promise<MenuDetail[]> {
    const conditions = [];
    if (query.mealDate) {
      conditions.push(eq(meals.mealDate, query.mealDate));
    }
    if (query.mealType) {
      conditions.push(eq(meals.mealType, query.mealType));
    }
    if (query.status) {
      conditions.push(eq(meals.status, query.status));
    }

    const rows = await this.db
      .select()
      .from(meals)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(meals.mealDate), asc(meals.mealType), asc(meals.createdAt));

    return Promise.all(rows.map((meal) => this.getDetail(meal.id)));
  }

  listToday(query: Omit<MealQuery, 'mealDate'>): Promise<MenuDetail[]> {
    return this.list({ ...query, mealDate: this.today() });
  }

  async getDetail(id: string): Promise<MenuDetail> {
    const meal = await this.findMealById(id);
    const orderRows = await this.db
      .select({
        order: orders,
        user: {
          username: users.username,
        },
        dish: dishes,
        category: categories,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .innerJoin(dishes, eq(orders.dishId, dishes.id))
      .leftJoin(categories, eq(dishes.categoryId, categories.id))
      .where(eq(orders.mealId, id))
      .orderBy(asc(orders.createdAt));

    return toMenuDetail({ meal, rows: orderRows });
  }

  async addOrder(mealId: string, input: AddOrderInput, user: JwtPayload): Promise<MenuDetail> {
    const meal = await this.findMealById(mealId);
    if (meal.status === 'completed') {
      throw new ConflictException('本次点餐已完成，不能继续加菜');
    }
    await this.assertActiveDish(input.dishId);

    await this.db.transaction(async (tx) => {
      const existing = await tx
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.mealId, mealId),
            eq(orders.dishId, input.dishId),
            eq(orders.userId, user.sub),
          ),
        )
        .limit(1);

      const current = existing[0];
      if (current) {
        await tx
          .update(orders)
          .set({
            quantity: current.quantity + input.quantity,
            note: input.note ?? current.note,
          })
          .where(eq(orders.id, current.id));
        return;
      }

      await tx.insert(orders).values({
        mealId,
        dishId: input.dishId,
        userId: user.sub,
        guestName: null,
        quantity: input.quantity,
        note: input.note ?? null,
      });
    });

    return this.getDetail(mealId);
  }

  async complete(id: string): Promise<MenuDetail> {
    const meal = await this.findMealById(id);
    if (meal.status === 'completed') {
      throw new ConflictException('本次点餐已完成');
    }

    const [updated] = await this.db
      .update(meals)
      .set({ status: 'completed', completedAt: new Date() })
      .where(eq(meals.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException('餐次不存在');
    }
    return this.getDetail(id);
  }

  private async findOrderingMeal(
    mealDate: string,
    mealType: MealRow['mealType'],
  ): Promise<MealRow | null> {
    const rows = await this.db
      .select()
      .from(meals)
      .where(
        and(
          eq(meals.mealDate, mealDate),
          eq(meals.mealType, mealType),
          eq(meals.status, 'ordering'),
        ),
      )
      .limit(1);
    return rows[0] ?? null;
  }

  private async findMealById(id: string): Promise<MealRow> {
    const rows = await this.db.select().from(meals).where(eq(meals.id, id)).limit(1);
    const meal = rows[0];
    if (!meal) {
      throw new NotFoundException('餐次不存在');
    }
    return meal;
  }

  private async assertActiveDish(id: string): Promise<void> {
    const rows = await this.db
      .select({ id: dishes.id })
      .from(dishes)
      .where(and(eq(dishes.id, id), eq(dishes.isActive, true)))
      .limit(1);
    if (!rows[0]) {
      throw new NotFoundException('菜谱不存在或已停用');
    }
  }

  private today(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const day = `${now.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private defaultTitle(mealDate: string, mealType: string): string {
    return `${mealDate} ${mealType}`;
  }
}
