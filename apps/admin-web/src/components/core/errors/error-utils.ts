import { ApiError, getApiErrorMessage } from '~/lib/error-parser';

export interface ParsedRouteError {
  detail?: string;
  message: string;
  name?: string;
  reason?: string;
  status?: number;
  stack?: string;
}

function isRouteErrorResponse(error: unknown): error is {
  status?: number;
  statusText?: string;
  data?: unknown;
} {
  return Boolean(error && typeof error === 'object' && ('status' in error || 'statusText' in error));
}

function stringifyUnknown(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error == null) return '未知错误';
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function parseRouteError(error: unknown): ParsedRouteError {
  if (error instanceof ApiError) {
    const detail = [
      '类型：接口请求失败',
      error.status ? `状态码：${error.status}` : null,
      error.code ? `错误码：${error.code}` : null,
      `信息：${getApiErrorMessage(error)}`,
      error.reason ? `原因：${error.reason}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    return {
      detail,
      message: getApiErrorMessage(error),
      name: error.name,
      reason: error.reason,
      status: error.status,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || '页面渲染失败',
      name: error.name,
      stack: error.stack,
    };
  }

  if (isRouteErrorResponse(error)) {
    const data = error.data;
    const dataMessage =
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message?: unknown }).message)
        : undefined;
    return {
      message: dataMessage || error.statusText || '页面请求失败',
      name: 'RouteErrorResponse',
      status: error.status,
    };
  }

  return {
    message: stringifyUnknown(error),
  };
}
