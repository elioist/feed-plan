import { queryOptions } from '@tanstack/react-query';
import type { DishListQuery } from '@feed-plan/shared';
import { getDish, listDishes } from '~/api/dishes';

export const dishQueries = {
  list: (query: DishListQuery = {}) =>
    queryOptions({
      queryKey: ['dishes', query],
      queryFn: () => listDishes(query),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: ['dishes', id],
      queryFn: () => getDish(id),
    }),
};
