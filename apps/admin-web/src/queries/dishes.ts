import { queryOptions } from '@tanstack/react-query';
import type { DishListQuery } from '@feed-plan/shared';
import { api } from '~/lib/api-client';

export const dishQueries = {
  list: (query: DishListQuery = {}) =>
    queryOptions({
      queryKey: ['dishes', query],
      queryFn: () => api.dishes.list(query),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: ['dishes', id],
      queryFn: () => api.dishes.get(id),
    }),
};
