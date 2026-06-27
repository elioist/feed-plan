import { queryOptions } from '@tanstack/react-query';
import type { CategoryListQuery } from '@feed-plan/shared';
import { api } from '~/lib/api-client';

export const categoryQueries = {
  all: (query: CategoryListQuery = {}) =>
    queryOptions({
      queryKey: ['categories', query],
      queryFn: () => api.categories.list(query),
    }),
};
