import { dayjs } from './dayjs.js';

export type DateTimeValue = Date | string | number | null | undefined;

export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const LOCALIZED_DATE_TIME_FORMAT = 'lll';

export function formatDateTime(
  value: DateTimeValue,
  template = DATE_TIME_FORMAT,
) {
  if (!value) return null;

  const date = dayjs(value);
  return date.isValid() ? date.format(template) : null;
}

export function formatRelativeDateTime(
  value: DateTimeValue,
  options: {
    displayAbsoluteTimeAfterDay?: number;
    absoluteFormat?: string;
  } = {},
) {
  if (!value) return null;

  const date = dayjs(value);
  if (!date.isValid()) return null;

  const {
    displayAbsoluteTimeAfterDay,
    absoluteFormat = LOCALIZED_DATE_TIME_FORMAT,
  } = options;

  if (
    displayAbsoluteTimeAfterDay &&
    Math.abs(date.diff(new Date(), 'day')) > displayAbsoluteTimeAfterDay
  ) {
    return date.format(absoluteFormat);
  }

  return dayjs.duration(date.diff(dayjs(), 'minute'), 'minute').humanize();
}

export function getRelativeDateTimeUpdateInterval(
  value: DateTimeValue,
  relativeBeforeDay?: number,
) {
  if (!value || !relativeBeforeDay) return null;

  const date = dayjs(value);
  if (!date.isValid()) return null;

  const diffInSeconds = Math.abs(date.diff(new Date(), 'second'));
  if (diffInSeconds <= 60) return 1000;

  const diffInMinutes = Math.abs(date.diff(new Date(), 'minute'));
  if (diffInMinutes <= 60) return 60000;

  const diffInHours = Math.abs(date.diff(new Date(), 'hour'));
  if (diffInHours <= 24) return 3600000;

  const diffInDays = Math.abs(date.diff(new Date(), 'day'));
  if (diffInDays <= relativeBeforeDay) return 86400000;

  return null;
}

export function formatTimeToSeconds(value?: string | number) {
  if (typeof value === 'number' || value === undefined) return value;

  const formats = ['h:mm:ss', 'mm:ss', 'm:ss'];
  for (const format of formats) {
    const date = dayjs(value, format);
    if (date.isValid()) {
      return date.hour() * 3600 + date.minute() * 60 + date.second();
    }
  }

  return undefined;
}
