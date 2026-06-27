import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, arrayContains, asc, eq, ilike, inArray, or } from 'drizzle-orm';
import { categories, dishes, permissionActionBindings, type CategoryRow, type DishRow } from '@feed-plan/db';
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
import { isForeignKeyViolation } from '../common/db-errors.js';
import { ACCESS_ACTIONS } from '../auth/access-actions.js';

@Injectable()
export class DishesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async list(query: DishListQuery, user: JwtPayload): Promise<DishSummary[]> {
    const canManageRecipes = await this.userCanManageRecipes(user);
    const where = this.buildListWhere(query, canManageRecipes);
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
    if (!detail || (!(await this.userCanManageRecipes(user)) && !detail.dish.isActive)) {
      throw new NotFoundException('菜谱不存在');
    }
    return toDishDetail(detail);
  }

  async create(input: CreateDishInput): Promise<DishDetail> {
    await this.assertCategoryExists(input.categoryId);

    const [dish] = await this.db
      .insert(dishes)
      .values({
        name: input.name,
        categoryId: input.categoryId,
        coverImage: input.coverImage ?? null,
        description: input.description ?? null,
        referenceUrl: input.referenceUrl ?? null,
        recipeContent: sanitizeRecipeContent(input.recipeContent),
        difficulty: input.difficulty,
        tags: input.tags,
        dietary: input.dietary,
        isActive: input.isActive,
      })
      .returning();
    if (!dish) {
      throw new BadRequestException('菜谱创建失败');
    }

    const detail = await this.loadDetail(dish.id);
    if (!detail) {
      throw new NotFoundException('菜谱不存在');
    }
    return toDishDetail(detail);
  }

  async update(id: string, input: UpdateDishInput): Promise<DishDetail> {
    await this.assertDishExists(id);
    if (input.categoryId) {
      await this.assertCategoryExists(input.categoryId);
    }

    const dishPatch = this.toDishPatch(input);
    if (Object.keys(dishPatch).length > 0) {
      await this.db
        .update(dishes)
        .set({
          ...dishPatch,
          updatedAt: new Date(),
        })
        .where(eq(dishes.id, id));
    }

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

  async remove(id: string): Promise<void> {
    await this.assertDishExists(id);

    try {
      await this.db.delete(dishes).where(eq(dishes.id, id));
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException('菜谱已被点餐引用，不能删除，请改为停用');
      }
      throw error;
    }
  }

  private buildListWhere(query: DishListQuery, canManageRecipes: boolean) {
    const conditions = [];
    if (!canManageRecipes) {
      conditions.push(eq(dishes.isActive, true));
    } else if (query.isActive !== undefined) {
      conditions.push(eq(dishes.isActive, query.isActive));
    }
    if (query.categoryId) {
      conditions.push(eq(dishes.categoryId, query.categoryId));
    }
    if (query.keyword) {
      const keyword = `%${query.keyword}%`;
      conditions.push(
        or(
          ilike(dishes.name, keyword),
          ilike(dishes.description, keyword),
          ilike(dishes.recipeContent, keyword),
        ),
      );
    }
    if (query.tag) {
      conditions.push(arrayContains(dishes.tags, [query.tag]));
    }
    if (query.dietary) {
      conditions.push(arrayContains(dishes.dietary, [query.dietary]));
    }
    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  private async userCanManageRecipes(user: JwtPayload): Promise<boolean> {
    const permissionIds = user.permissions.map((permission) => permission.id);
    if (permissionIds.length === 0) return false;
    const rows = await this.db
      .select({ action: permissionActionBindings.action })
      .from(permissionActionBindings)
      .where(
        and(
          eq(permissionActionBindings.action, ACCESS_ACTIONS.recipesManage),
          inArray(permissionActionBindings.permissionId, permissionIds),
        ),
      )
      .limit(1);
    return Boolean(rows[0]);
  }

  private async loadDetail(id: string): Promise<{
    dish: DishRow;
    category: CategoryRow | null;
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

    return {
      dish: row.dish,
      category: row.category,
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

  private toDishPatch(input: UpdateDishInput): Partial<typeof dishes.$inferInsert> {
    return {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      ...(input.coverImage !== undefined ? { coverImage: input.coverImage ?? null } : {}),
      ...(input.description !== undefined ? { description: input.description ?? null } : {}),
      ...(input.referenceUrl !== undefined ? { referenceUrl: input.referenceUrl ?? null } : {}),
      ...(input.recipeContent !== undefined
        ? { recipeContent: sanitizeRecipeContent(input.recipeContent) }
        : {}),
      ...(input.difficulty !== undefined ? { difficulty: input.difficulty } : {}),
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
      ...(input.dietary !== undefined ? { dietary: input.dietary } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    };
  }
}

function sanitizeRecipeContent(content: string): string {
  const allowedTags = new Set([
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'ul',
    'ol',
    'li',
    'blockquote',
    'h2',
    'h3',
    'a',
  ]);

  return content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(
      /<(\/?)([a-z0-9]+)([^>]*)>/gi,
      (_match, closing: string, tagName: string, attrs: string) => {
        const tag = tagName.toLowerCase();
        if (!allowedTags.has(tag)) return '';
        if (closing) return '</' + tag + '>';
        if (tag !== 'a') return '<' + tag + '>';

        const href = attrs.match(/\shref=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
        const hrefValue = href?.[1] ?? href?.[2] ?? href?.[3] ?? '';
        if (!/^https?:\/\//i.test(hrefValue)) return '<a>';
        return '<a href="' + hrefValue + '" target="_blank" rel="noopener noreferrer">';
      },
    )
    .trim();
}
