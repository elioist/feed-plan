import { queryOptions } from '@tanstack/react-query';
import { listUsers } from '~/api/users';

export const userQueries = {
  all: () =>
    queryOptions({
      queryKey: ['users'],
      queryFn: () => listUsers(),
    }),
};
