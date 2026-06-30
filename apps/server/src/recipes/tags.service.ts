import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq, ilike, inArray } from 'drizzle-orm';
import { tags, type TagRow } from '@feed-plan/db';
import type { CreateTagInput, Tag, TagListQuery, UpdateTagInput } from '@feed-plan/shared';
import { isUniqueViolation } from '../common/db-errors.js';
import { DRIZZLE, type DrizzleDb } from '../drizzle/drizzle.constants.js';

function toTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sortOrder,
    isSystem: row.isSystem,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

@Injectable()
export class TagsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async list(query: TagListQuery = {}): Promise<Tag[]> {
    const rows = await this.db
      .select()
      .from(tags)
      .where(query.keyword ? ilike(tags.name, `%${query.keyword}%`) : undefined)
      .orderBy(asc(tags.sortOrder), asc(tags.createdAt));
    return rows.map(toTag);
  }

  async create(input: CreateTagInput): Promise<Tag> {
    try {
      const [row] = await this.db
        .insert(tags)
        .values({ name: input.name, sortOrder: input.sortOrder })
        .returning();
      if (!row) throw new ConflictException('标签创建失败');
      return toTag(row);
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException('标签名称已存在');
      throw error;
    }
  }

  async update(id: string, input: UpdateTagInput): Promise<Tag> {
    try {
      const [row] = await this.db
        .update(tags)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(tags.id, id))
        .returning();
      if (!row) throw new NotFoundException('标签不存在');
      return toTag(row);
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException('标签名称已存在');
      throw error;
    }
  }

  async reorder(ids: string[]): Promise<void> {
    const rows = await this.db.select({ id: tags.id }).from(tags).where(inArray(tags.id, ids));

    if (rows.length !== ids.length) {
      throw new NotFoundException('标签不存在');
    }

    const updatedAt = new Date();
    await this.db.transaction(async (tx) => {
      await Promise.all(
        ids.map((id, index) =>
          tx
            .update(tags)
            .set({
              sortOrder: (index + 1) * 10,
              updatedAt,
            })
            .where(eq(tags.id, id)),
        ),
      );
    });
  }

  async remove(id: string): Promise<void> {
    const [row] = await this.db.delete(tags).where(eq(tags.id, id)).returning();
    if (!row) throw new NotFoundException('标签不存在');
  }
}
