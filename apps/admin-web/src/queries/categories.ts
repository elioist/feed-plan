import { queryOptions } from '@tanstack/react-query';
import { api } from '~/lib/api-client';

export const categoryQueries = {
  all: () =>
    queryOptions({
      queryKey: ['categories'],
      queryFn: api.categories.list,
    }),
};
