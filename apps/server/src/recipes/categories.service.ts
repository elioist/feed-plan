import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq, ilike, inArray } from 'drizzle-orm';
import { categories, dishes, type CategoryRow } from '@feed-plan/db';
import type {
  Category,
  CategoryListQuery,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@feed-plan/shared';
import { DRIZZLE, type DrizzleDb } from '../drizzle/drizzle.constants.js';
import { toCategory } from './recipe-mappers.js';

@Injectable()
export class CategoriesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async list(query: CategoryListQuery = {}): Promise<Category[]> {
    const rows = await this.db
      .select()
      .from(categories)
      .where(query.keyword ? ilike(categories.name, `%${query.keyword}%`) : undefined)
      .orderBy(asc(categories.sortOrder), asc(categories.createdAt));
    return rows.map(toCategory);
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const [row] = await this.db
      .insert(categories)
      .values({
        name: input.name,
        sortOrder: input.sortOrder,
      })
      .returning();
    if (!row) {
      throw new NotFoundException('分类创建失败');
    }
    return toCategory(row);
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    const [row] = await this.db
      .update(categories)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    if (!row) {
      throw new NotFoundException('分类不存在');
    }
    return toCategory(row);
  }

  async reorder(ids: string[]): Promise<void> {
    const rows = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(inArray(categories.id, ids));

    if (rows.length !== ids.length) {
      throw new NotFoundException('分类不存在');
    }

    const updatedAt = new Date();
    await this.db.transaction(async (tx) => {
      await Promise.all(
        ids.map((id, index) =>
          tx
            .update(categories)
            .set({
              sortOrder: (index + 1) * 10,
              updatedAt,
            })
            .where(eq(categories.id, id)),
        ),
      );
    });
  }

  async remove(id: string): Promise<void> {
    const category = await this.findRowById(id);

    await this.db
      .update(dishes)
      .set({ categoryId: null, updatedAt: new Date() })
      .where(eq(dishes.categoryId, category.id));
    await this.db.delete(categories).where(eq(categories.id, id));
  }

  async findRowById(id: string): Promise<CategoryRow> {
    const rows = await this.db.select().from(categories).where(eq(categories.id, id)).limit(1);
    const row = rows[0];
    if (!row) {
      throw new NotFoundException('分类不存在');
    }
    return row;
  }
}
