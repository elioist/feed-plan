import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

export const PUBLIC_UPLOAD_PREFIX = '/uploads';

export function resolveUploadDir(): string {
  return resolve(process.cwd(), process.env.UPLOAD_DIR ?? 'uploads');
}

export function ensureUploadDir(): string {
  const dir = resolveUploadDir();
  mkdirSync(dir, { recursive: true });
  return dir;
}
