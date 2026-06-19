/** Postgres 错误码识别工具 */

function hasCode(error: unknown, code: string): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as { code?: unknown; cause?: { code?: unknown } };
  return candidate.code === code || candidate.cause?.code === code;
}

/** 外键约束冲突（23503） */
export function isForeignKeyViolation(error: unknown): boolean {
  return hasCode(error, '23503');
}

/** 唯一约束冲突（23505） */
export function isUniqueViolation(error: unknown): boolean {
  return hasCode(error, '23505');
}
