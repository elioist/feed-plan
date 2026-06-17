import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq, ilike, or } from 'drizzle-orm';
import {
  categories,
  dishes,
  ingredients,
  recipeSteps,
  type CategoryRow,
  type DishRow,
} from '@feed-plan/db';
import type {
  CreateDishInput,
  DishDetail,
  DishListQuery,
  DishSummary,
  JwtPayload,
  UpdateDishActiveInput,
  UpdateDishInput,
} from '@feed-plan/shared';
import { DRIZZLE, type DrizzleDb } from '../drizzle/drizzle.constants.js';
import { toDishDetail, toDishSummary } from './recipe-mappers.js';

@Injectable()
export class DishesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async list(query: DishListQuery, user: JwtPayload): Promise<DishSummary[]> {
    const where = this.buildListWhere(query, user);
    const rows = await this.db
      .select({ dish: dishes, category: categories })
      .from(dishes)
      .leftJoin(categories, eq(dishes.categoryId, categories.id))
      .where(where)
      .orderBy(asc(dishes.createdAt), asc(dishes.name));

    return rows.map((row) => toDishSummary(row.dish, row.category));
  }

  async getById(id: string, user: JwtPayload): Promise<DishDetail> {
    const detail = await this.loadDetail(id);
    if (!detail || (user.role !== 'chef' && !detail.dish.isActive)) {
      throw new NotFoundException('菜谱不存在');
    }
    return toDishDetail(detail);
  }

  async create(input: CreateDishInput): Promise<DishDetail> {
    this.assertUniqueStepNos(input.steps);
    await this.assertCategoryExists(input.categoryId);

    const dish = await this.db.transaction(async (tx) => {
      const [created] = await tx
        .insert(dishes)
        .values({
          name: input.name,
          categoryId: input.categoryId,
          coverImage: input.coverImage ?? null,
          description: input.description ?? null,
          biliVideo: input.biliVideo ?? null,
          difficulty: input.difficulty,
          isActive: input.isActive,
        })
        .returning();
      if (!created) {
        throw new BadRequestException('菜谱创建失败');
      }

      if (input.ingredients.length > 0) {
        await tx.insert(ingredients).values(
          input.ingredients.map((item, index) => ({
            dishId: created.id,
            name: item.name,
            amount: item.amount,
            sortOrder: item.sortOrder ?? index,
          })),
        );
      }

      if (input.steps.length > 0) {
        await tx.insert(recipeSteps).values(
          input.steps.map((step) => ({
            dishId: created.id,
            stepNo: step.stepNo,
            content: step.content,
            image: step.image ?? null,
          })),
        );
      }

      return created;
    });

    const detail = await this.loadDetail(dish.id);
    if (!detail) {
      throw new NotFoundException('菜谱不存在');
    }
    return toDishDetail(detail);
  }

  async update(id: string, input: UpdateDishInput): Promise<DishDetail> {
    if (input.steps) {
      this.assertUniqueStepNos(input.steps);
    }
    await this.assertDishExists(id);
    if (input.categoryId) {
      await this.assertCategoryExists(input.categoryId);
    }

    await this.db.transaction(async (tx) => {
      const dishPatch = this.toDishPatch(input);
      if (Object.keys(dishPatch).length > 0) {
        await tx
          .update(dishes)
          .set({
            ...dishPatch,
            updatedAt: new Date(),
          })
          .where(eq(dishes.id, id));
      }

      if (input.ingredients) {
        await tx.delete(ingredients).where(eq(ingredients.dishId, id));
        if (input.ingredients.length > 0) {
          await tx.insert(ingredients).values(
            input.ingredients.map((item, index) => ({
              dishId: id,
              name: item.name,
              amount: item.amount,
              sortOrder: item.sortOrder ?? index,
            })),
          );
        }
      }

      if (input.steps) {
        await tx.delete(recipeSteps).where(eq(recipeSteps.dishId, id));
        if (input.steps.length > 0) {
          await tx.insert(recipeSteps).values(
            input.steps.map((step) => ({
              dishId: id,
              stepNo: step.stepNo,
              content: step.content,
              image: step.image ?? null,
            })),
          );
        }
      }
    });

    const detail = await this.loadDetail(id);
    if (!detail) {
      throw new NotFoundException('菜谱不存在');
    }
    return toDishDetail(detail);
  }

  async setActive(id: string, input: UpdateDishActiveInput): Promise<DishDetail> {
    await this.assertDishExists(id);
    const [row] = await this.db
      .update(dishes)
      .set({ isActive: input.isActive, updatedAt: new Date() })
      .where(eq(dishes.id, id))
      .returning();
    if (!row) {
      throw new NotFoundException('菜谱不存在');
    }

    const detail = await this.loadDetail(row.id);
    if (!detail) {
      throw new NotFoundException('菜谱不存在');
    }
    return toDishDetail(detail);
  }

  softDelete(id: string): Promise<DishDetail> {
    return this.setActive(id, { isActive: false });
  }

  private buildListWhere(query: DishListQuery, user: JwtPayload) {
    const conditions = [];
    if (user.role !== 'chef') {
      conditions.push(eq(dishes.isActive, true));
    } else if (query.isActive !== undefined) {
      conditions.push(eq(dishes.isActive, query.isActive));
    }
    if (query.categoryId) {
      conditions.push(eq(dishes.categoryId, query.categoryId));
    }
    if (query.keyword) {
      const keyword = `%${query.keyword}%`;
      conditions.push(or(ilike(dishes.name, keyword), ilike(dishes.description, keyword)));
    }
    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  private async loadDetail(id: string): Promise<{
    dish: DishRow;
    category: CategoryRow | null;
    ingredients: (typeof ingredients.$inferSelect)[];
    steps: (typeof recipeSteps.$inferSelect)[];
  } | null> {
    const dishRows = await this.db
      .select({ dish: dishes, category: categories })
      .from(dishes)
      .leftJoin(categories, eq(dishes.categoryId, categories.id))
      .where(eq(dishes.id, id))
      .limit(1);

    const row = dishRows[0];
    if (!row) {
      return null;
    }

    const ingredientRows = await this.db
      .select()
      .from(ingredients)
      .where(eq(ingredients.dishId, id))
      .orderBy(asc(ingredients.sortOrder), asc(ingredients.name));
    const stepRows = await this.db
      .select()
      .from(recipeSteps)
      .where(eq(recipeSteps.dishId, id))
      .orderBy(asc(recipeSteps.stepNo));

    return {
      dish: row.dish,
      category: row.category,
      ingredients: ingredientRows,
      steps: stepRows,
    };
  }

  private async assertCategoryExists(id: string): Promise<void> {
    const rows = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    if (!rows[0]) {
      throw new NotFoundException('分类不存在');
    }
  }

  private async assertDishExists(id: string): Promise<void> {
    const rows = await this.db
      .select({ id: dishes.id })
      .from(dishes)
      .where(eq(dishes.id, id))
      .limit(1);
    if (!rows[0]) {
      throw new NotFoundException('菜谱不存在');
    }
  }

  private assertUniqueStepNos(steps: { stepNo: number }[]): void {
    const stepNos = new Set<number>();
    for (const step of steps) {
      if (stepNos.has(step.stepNo)) {
        throw new BadRequestException('做法步骤编号不能重复');
      }
      stepNos.add(step.stepNo);
    }
  }

  private toDishPatch(input: UpdateDishInput): Partial<typeof dishes.$inferInsert> {
    return {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      ...(input.coverImage !== undefined ? { coverImage: input.coverImage ?? null } : {}),
      ...(input.description !== undefined ? { description: input.description ?? null } : {}),
      ...(input.biliVideo !== undefined ? { biliVideo: input.biliVideo ?? null } : {}),
      ...(input.difficulty !== undefined ? { difficulty: input.difficulty } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    };
  }
}
