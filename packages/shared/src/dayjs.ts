import 'dayjs/locale/zh-cn.js';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import duration from 'dayjs/plugin/duration.js';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';

let dayjsInitialized = false;

export function initializeDayjs(locale = 'zh-cn') {
  if (!dayjsInitialized) {
    dayjs.extend(duration);
    dayjs.extend(relativeTime);
    dayjs.extend(localizedFormat);
    dayjs.extend(customParseFormat);
    dayjsInitialized = true;
  }

  dayjs.locale(locale);
}

export { dayjs };
