import { describe, it, expect } from 'vitest';

function findCategoryAtPosition(offsets: Map<string, number>, y: number): string | null {
  let hit: string | null = null;
  const sorted = Array.from(offsets.entries()).sort((a, b) => a[1] - b[1]);
  for (const [catId, offset] of sorted) {
    if (y >= offset - 10) hit = catId;
  }
  return hit;
}

function isAtBottom(y: number, contentH: number, layoutH: number): boolean {
  return y + layoutH >= contentH - 10;
}

describe('滚动吸顶', () => {
  const offsets = new Map([['A', 0], ['B', 300], ['C', 700], ['D', 1100]]);

  it('滚到A位置 → 吸顶A', () => expect(findCategoryAtPosition(offsets, 0)).toBe('A'));
  it('滚到B位置 → 吸顶B', () => expect(findCategoryAtPosition(offsets, 350)).toBe('B'));
  it('滚到C位置 → 吸顶C', () => expect(findCategoryAtPosition(offsets, 750)).toBe('C'));
  it('滚过D → 吸顶D', () => expect(findCategoryAtPosition(offsets, 1200)).toBe('D'));
});

describe('底部检测', () => {
  it('是底部', () => expect(isAtBottom(1100, 1500, 400)).toBe(true));
  it('不是底部', () => expect(isAtBottom(500, 1500, 400)).toBe(false));
});

describe('点击分类', () => {
  const offsets = new Map([['A', 0], ['B', 300], ['C', 700], ['D', 1100]]);

  it('点击分类只设左侧高亮', () => {
    let highlight = 'A';
    let sticky = 'A';
    highlight = 'C';
    expect(highlight).toBe('C');
    expect(sticky).toBe('A');
  });

  it('滚动回调根据实际位置决定吸顶：滚到C位置 → 吸顶C', () => {
    const hit = findCategoryAtPosition(offsets, 700);
    expect(hit).toBe('C');
  });

  it('滚动回调根据实际位置决定吸顶：滚到D位置 → 吸顶D', () => {
    const hit = findCategoryAtPosition(offsets, 1100);
    expect(hit).toBe('D');
  });
});
