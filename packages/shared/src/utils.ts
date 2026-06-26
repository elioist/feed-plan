import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Nullable<T> = T | null | undefined;

export const noop = () => {};

export const alwaysFalse = () => false;

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const once = <T>(fn: () => T): (() => T) => {
  let initialized = false;
  let value: T;

  return () => {
    if (!initialized) {
      initialized = true;
      value = fn();
    }

    return value;
  };
};

// eslint-disable-next-line no-control-regex
export const isASCII = (value: string) => /^[\u0000-\u007F]*$/.test(value);

export const capitalizeFirstLetter = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const isEmptyObject = (obj: Record<string, unknown>) => Object.keys(obj).length === 0;

export const omitUndefined = <T extends Record<string, unknown>>(obj: T) => {
  const nextObj = {} as Partial<T>;

  for (const key of Object.keys(obj) as Array<keyof T>) {
    if (obj[key] !== undefined) {
      nextObj[key] = obj[key];
    }
  }

  return nextObj;
};

export const omitShallow = <T>(obj: T, ...keys: string[]): T => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;

  const nextObj = { ...obj } as Record<string, unknown>;
  for (const key of keys) {
    Reflect.deleteProperty(nextObj, key);
  }

  return nextObj as T;
};

export const sortByAlphabet = (a: string | null | undefined, b: string | null | undefined) => {
  const safeA = String(a ?? '');
  const safeB = String(b ?? '');

  const isALetter = /^[a-z]/i.test(safeA);
  const isBLetter = /^[a-z]/i.test(safeB);

  if (isALetter && !isBLetter) return -1;
  if (!isALetter && isBLetter) return 1;
  if (isALetter && isBLetter) return safeA.localeCompare(safeB);

  return safeA.localeCompare(safeB, 'zh-CN');
};

export const parseSafeUrl = (url: string) => {
  try {
    return new URL(url);
  } catch {
    return null;
  }
};

export const resolveUrlWithBase = (url: string, baseUrl: string) => {
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
};

type QueryValue = string | number | boolean | null | undefined;
export type QueryParams<T extends object = Record<string, QueryValue | readonly QueryValue[]>> = {
  readonly [K in keyof T]: T[K] extends QueryValue | readonly QueryValue[] ? T[K] : never;
};

export function buildPathWithQuery<T extends object>(path: string, params?: QueryParams<T>) {
  if (!params) return path;

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(
    params as Record<string, QueryValue | readonly QueryValue[]>,
  )) {
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      if (item === null || item === undefined || item === '') continue;
      query.append(key, String(item));
    }
  }

  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export function formatDuration(totalSeconds?: number) {
  if (!totalSeconds || totalSeconds <= 0) return undefined;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');

  if (hours === 0) return `${mm}:${ss}`;

  const hh = hours.toString().padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function timeStringToSeconds(time: string): number | null {
  const timeParts = time.split(':').map(Number);
  if (timeParts.some(Number.isNaN)) return null;

  if (timeParts.length === 2) {
    const [minutes = 0, seconds = 0] = timeParts;
    return minutes * 60 + seconds;
  }

  if (timeParts.length === 3) {
    const [hours = 0, minutes = 0, seconds = 0] = timeParts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  return null;
}

export const formatEstimatedMins = (estimatedMins: number) => {
  const minutesInHour = 60;
  const minutesInDay = minutesInHour * 24;
  const minutesInMonth = minutesInDay * 30;

  const months = Math.floor(estimatedMins / minutesInMonth);
  const days = Math.floor((estimatedMins % minutesInMonth) / minutesInDay);
  const hours = Math.floor((estimatedMins % minutesInDay) / minutesInHour);
  const minutes = estimatedMins % minutesInHour;

  if (months > 0) return `${months}M ${days}d`;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;

  return `${estimatedMins} mins`;
};

export function combineCleanupFunctions(...fns: Array<Nullable<(() => void) | void>>) {
  return () => {
    fns.forEach((fn) => {
      if (typeof fn === 'function') {
        fn();
      }
    });
  };
}

export function getDateISOString(dateOrDateString: Date | string | null): string | null {
  if (!dateOrDateString) return null;
  if (typeof dateOrDateString === 'string') return dateOrDateString;
  return dateOrDateString.toISOString();
}

export const isCJKChar = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0x3400 && code <= 0x4dbf) ||
    (code >= 0xf900 && code <= 0xfaff) ||
    (code >= 0x3040 && code <= 0x309f) ||
    (code >= 0x30a0 && code <= 0x30ff)
  );
};

export const getNameInitials = (name?: string): string => {
  if (!name) return '';

  const first = name[0]!;
  const second = name[1];

  if (isCJKChar(first)) return first;
  if (second && isCJKChar(second)) return first;

  return name.slice(0, 2);
};
