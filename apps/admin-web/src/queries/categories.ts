import { queryOptions } from '@tanstack/react-query';
import { listCategories } from '~/api/categories';

export const categoryQueries = {
  all: () =>
    queryOptions({
      queryKey: ['categories'],
      queryFn: () => listCategories(),
    }),
};
