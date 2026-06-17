import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { categories, dishes, type CategoryRow } from '@feed-plan/db';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@feed-plan/shared';
import { DRIZZLE, type DrizzleDb } from '../drizzle/drizzle.constants.js';
import { toCategory } from './recipe-mappers.js';

@Injectable()
export class CategoriesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async list(): Promise<Category[]> {
    const rows = await this.db
      .select()
      .from(categories)
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

  async remove(id: string): Promise<void> {
    const category = await this.findRowById(id);
    const referenced = await this.db
      .select({ id: dishes.id })
      .from(dishes)
      .where(eq(dishes.categoryId, category.id))
      .limit(1);

    if (referenced[0]) {
      throw new ConflictException('该分类下仍有菜谱，不能删除');
    }

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
