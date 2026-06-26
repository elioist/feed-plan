import { describe, expect, it, vi } from 'vitest';
import {
  buildPathWithQuery,
  combineCleanupFunctions,
  formatDuration,
  getNameInitials,
  omitShallow,
  omitUndefined,
  once,
  parseSafeUrl,
  resolveUrlWithBase,
  sortByAlphabet,
  timeStringToSeconds,
} from './utils.js';

describe('shared utils', () => {
  it('runs once callbacks only once', () => {
    const fn = vi.fn(() => Math.random());
    const read = once(fn);
    const first = read();
    const second = read();

    expect(first).toBe(second);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('omits undefined values without removing null values', () => {
    expect(omitUndefined({ a: 1, b: undefined, c: null })).toEqual({ a: 1, c: null });
  });

  it('omits shallow keys from objects only', () => {
    expect(omitShallow({ a: 1, b: 2 }, 'b')).toEqual({ a: 1 });
    expect(omitShallow(['a', 'b'], '0')).toEqual(['a', 'b']);
  });

  it('sorts latin names before chinese names', () => {
    expect(['蒸蛋', 'apple', '包子'].sort(sortByAlphabet)).toEqual(['apple', '包子', '蒸蛋']);
  });

  it('parses safe urls and resolves relative urls', () => {
    expect(parseSafeUrl('not a url')).toBeNull();
    expect(parseSafeUrl('https://example.com')?.hostname).toBe('example.com');
    expect(resolveUrlWithBase('/images/a.jpg', 'https://example.com/api')).toBe(
      'https://example.com/images/a.jpg',
    );
  });

  it('builds paths with cleaned query params', () => {
    expect(
      buildPathWithQuery('/dishes', {
        isActive: true,
        empty: '',
        missing: undefined,
        tags: ['hot', 'quick'],
      }),
    ).toBe('/dishes?isActive=true&tags=hot&tags=quick');
  });

  it('formats and parses durations', () => {
    expect(formatDuration(59)).toBe('00:59');
    expect(formatDuration(3661)).toBe('01:01:01');
    expect(formatDuration(0)).toBeUndefined();
    expect(timeStringToSeconds('1:30')).toBe(90);
    expect(timeStringToSeconds('1:30:00')).toBe(5400);
    expect(timeStringToSeconds('nope')).toBeNull();
  });

  it('combines cleanup functions', () => {
    const first = vi.fn();
    const second = vi.fn();
    combineCleanupFunctions(first, undefined, second)();

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('gets initials for latin and cjk names', () => {
    expect(getNameInitials('Alice')).toBe('Al');
    expect(getNameInitials('小雅')).toBe('小');
    expect(getNameInitials()).toBe('');
  });
});
