import type { CreateTagInput, Tag, TagListQuery, UpdateTagInput } from '@feed-plan/shared';

import type { ApiRequest } from '../types.js';

export function createTagsResource(request: ApiRequest) {
  return {
    list(query?: TagListQuery) {
      return request<Tag[]>('/tags', { query });
    },
    create(input: CreateTagInput) {
      return request<Tag>('/tags', {
        method: 'POST',
        body: input,
      });
    },
    update(id: string, input: UpdateTagInput) {
      return request<Tag>(`/tags/${id}`, {
        method: 'PATCH',
        body: input,
      });
    },
    delete(id: string) {
      return request<{ ok: true }>(`/tags/${id}`, {
        method: 'DELETE',
      });
    },
  };
}
