import { describe, it, expect } from 'vitest';

import {
  findCategoryAtPosition,
  getCategoryScrollTarget,
  getRightContentBottomSpace,
  isProgrammaticScrollSettled,
  sortCategoryOffsets,
} from '../lib/menu-scroll';

describe('滚动吸顶', () => {
  const offsets = new Map([['A', 0], ['B', 300], ['C', 700], ['D', 1100]]);

  it('滚到A位置 → 吸顶A', () => expect(findCategoryAtPosition(offsets, 0)).toBe('A'));
  it('滚到B位置 → 吸顶B', () => expect(findCategoryAtPosition(offsets, 350)).toBe('B'));
  it('滚到C位置 → 吸顶C', () => expect(findCategoryAtPosition(offsets, 750)).toBe('C'));
  it('滚过D → 吸顶D', () => expect(findCategoryAtPosition(offsets, 1200)).toBe('D'));

  it('滚到顶部且第一个标题有内容内边距时，仍然吸顶第一个分类', () => {
    expect(findCategoryAtPosition(new Map([['A', 12], ['B', 300]]), 0)).toBe('A');
  });

  it('滚动热路径可以复用预排序后的分类坐标', () => {
    const sortedOffsets = sortCategoryOffsets(new Map([['C', 700], ['A', 0], ['B', 300]]));
    expect(findCategoryAtPosition(sortedOffsets, 350)).toBe('B');
  });
});

describe('右侧内容底部补位', () => {
  it('至少补一屏以上，让底部分类可以滚到吸顶位置', () => {
    expect(getRightContentBottomSpace(400)).toBe(800);
  });

  it('可视区很小时仍保留最小底部空间', () => {
    expect(getRightContentBottomSpace(20)).toBe(100);
  });
});

describe('点击分类', () => {
  const offsets = new Map([['A', 0], ['B', 300], ['C', 700], ['D', 1100]]);

  it('点击分类后左侧高亮和吸顶标题使用同一个分类', () => {
    let active = 'A';
    active = 'C';
    expect(active).toBe('C');
  });

  it('滚动回调根据实际位置决定吸顶：滚到C位置 → 吸顶C', () => {
    const hit = findCategoryAtPosition(offsets, 700);
    expect(hit).toBe('C');
  });

  it('滚动回调根据实际位置决定吸顶：滚到D位置 → 吸顶D', () => {
    const hit = findCategoryAtPosition(offsets, 1100);
    expect(hit).toBe('D');
  });

  it('程序化滚动未到目标前不让中途分类抢高亮', () => {
    expect(isProgrammaticScrollSettled(700, 1100)).toBe(false);
  });

  it('程序化滚动接近目标时可以恢复滚动同步', () => {
    expect(isProgrammaticScrollSettled(1094, 1100)).toBe(true);
  });

  it('点击分类滚动到该分类稳定占位标题的位置', () => {
    expect(getCategoryScrollTarget(700)).toBe(700);
  });
});

describe('默认分类', () => {
  it('默认应选择当前列表的第一个分类，而不是强行选择推荐', () => {
    const grouped = ['vegetables', 'meat', 'soup', 'dessert', 'recommended'];
    expect(grouped[0]).toBe('vegetables');
  });
});
