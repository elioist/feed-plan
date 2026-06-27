import type { ApiRequest } from './types.js';

export function uploadFile<T extends object>(path: string, file: File, request: ApiRequest) {
  const formData = new FormData();
  formData.append('file', file);

  return request<T>(path, {
    method: 'POST',
    body: formData,
  });
}
