import type { ApiRequest } from './types.js';

export interface NativeUploadFile {
  uri: string;
  name: string;
  type: string;
}

export type UploadFileInput = File | NativeUploadFile;

export function uploadFile<T extends object>(path: string, file: UploadFileInput, request: ApiRequest) {
  const formData = new FormData();
  formData.append('file', file as never);

  return request<T>(path, {
    method: 'POST',
    body: formData,
  });
}
