import { describe, expect, it, vi } from 'vitest';
import type { TagRow } from '@feed-plan/db';
import { TagsService } from './tags.service.js';

const tag: TagRow = {
  id: '11111111-1111-1111-1111-111111111111',
  name: '快手菜',
  sortOrder: 1,
  isSystem: false,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('TagsService', () => {
  it('按传入 id 顺序批量更新排序值', async () => {
    const updatedRows: unknown[] = [];
    const tx = {
      update: vi.fn(() => ({
        set: vi.fn((value) => {
          updatedRows.push(value);
          return { where: vi.fn(async () => undefined) };
        }),
      })),
    };
    const db = {
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(async () => [
            { id: tag.id },
            { id: '22222222-2222-2222-2222-222222222222' },
          ]),
        })),
      })),
      transaction: vi.fn(async (callback) => callback(tx)),
    };
    const service = new TagsService(db as never);

    await service.reorder([tag.id, '22222222-2222-2222-2222-222222222222']);

    expect(updatedRows).toEqual([
      expect.objectContaining({ sortOrder: 10, updatedAt: expect.any(Date) }),
      expect.objectContaining({ sortOrder: 20, updatedAt: expect.any(Date) }),
    ]);
  });
});
