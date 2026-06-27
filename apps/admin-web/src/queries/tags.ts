import { queryOptions } from '@tanstack/react-query';
import type { TagListQuery } from '@feed-plan/shared';
import { api } from '~/lib/api-client';

export const tagQueries = {
  list: (query: TagListQuery = {}) =>
    queryOptions({
      queryKey: ['tags', query],
      queryFn: () => api.tags.list(query),
    }),
};
