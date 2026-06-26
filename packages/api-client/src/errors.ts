import { FetchError } from 'ofetch';

export interface ApiErrorInfo {
  message: string;
  code?: string | number;
  status?: number;
  reason?: string;
}

export class ApiError extends Error {
  readonly code?: string | number;
  readonly status?: number;
  readonly reason?: string;
  readonly data?: unknown;

  constructor(info: ApiErrorInfo & { data?: unknown }) {
    super(info.message);
    this.name = 'ApiError';
    this.code = info.code;
    this.status = info.status;
    this.reason = info.reason;
    this.data = info.data;
  }
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

export function parseErrorData(data: unknown): Partial<ApiErrorInfo> | null {
  const parsed = typeof data === 'string' ? safeJsonParse(data) : data;
  if (!parsed || typeof parsed !== 'object') return null;

  const record = parsed as Record<string, unknown>;
  return {
    message: typeof record.message === 'string' ? record.message : undefined,
    code:
      typeof record.code === 'string' || typeof record.code === 'number' ? record.code : undefined,
    reason: typeof record.reason === 'string' ? record.reason : undefined,
  };
}

export function getApiErrorInfo(error: unknown): ApiErrorInfo {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
      reason: error.reason,
    };
  }

  if (error instanceof FetchError) {
    const parsed = parseErrorData(error.response?._data);
    const message = parsed?.message || error.message || '请求失败';

    return {
      ...parsed,
      message: parsed?.reason ? `${message}: ${parsed.reason}` : message,
      status: error.statusCode ?? error.response?.status,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  return { message: '请求失败' };
}

export function getApiErrorMessage(error: unknown) {
  return getApiErrorInfo(error).message;
}
