import { queryOptions } from '@tanstack/react-query';
import { api } from '~/lib/api-client';

export const userQueries = {
  all: () =>
    queryOptions({
      queryKey: ['users'],
      queryFn: api.users.list,
    }),
};
