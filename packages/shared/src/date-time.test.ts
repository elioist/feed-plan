import { beforeAll, describe, expect, it } from 'vitest';

import {
  formatDateTime,
  formatRelativeDateTime,
  formatTimeToSeconds,
  getRelativeDateTimeUpdateInterval,
} from './date-time.js';
import { initializeDayjs } from './dayjs.js';

describe('date time utils', () => {
  beforeAll(() => {
    initializeDayjs();
  });

  it('formats date time with the default template', () => {
    expect(formatDateTime(new Date('2026-06-19T10:00:00.000Z'))).toMatch(
      /^2026-06-19 \d{2}:00:00$/,
    );
  });

  it('supports custom format templates', () => {
    expect(formatDateTime('2026-06-19T10:30:00.000Z', 'YYYY-MM-DD')).toBe('2026-06-19');
  });

  it('returns null for empty or invalid values without UI copy', () => {
    expect(formatDateTime(null)).toBeNull();
    expect(formatDateTime('not-a-date')).toBeNull();
  });

  it('formats relative date time and switches to absolute time past the threshold', () => {
    const oneMinuteAgo = new Date(Date.now() - 60_000);
    expect(formatRelativeDateTime(oneMinuteAgo)).toBe('1 分钟');

    expect(
      formatRelativeDateTime('2026-06-19T10:30:00.000Z', {
        displayAbsoluteTimeAfterDay: 1,
        absoluteFormat: 'YYYY-MM-DD',
      }),
    ).toBe('2026-06-19');
  });

  it('calculates relative date time update intervals', () => {
    expect(getRelativeDateTimeUpdateInterval(new Date(Date.now() - 30_000), 29)).toBe(1000);
    expect(getRelativeDateTimeUpdateInterval(new Date(Date.now() - 30 * 60_000), 29)).toBe(60000);
    expect(getRelativeDateTimeUpdateInterval(null, 29)).toBeNull();
  });

  it('parses media-style time strings to seconds', () => {
    expect(formatTimeToSeconds('1:30')).toBe(90);
    expect(formatTimeToSeconds('1:30:00')).toBe(5400);
    expect(formatTimeToSeconds(42)).toBe(42);
    expect(formatTimeToSeconds('bad-value')).toBeUndefined();
  });
});
