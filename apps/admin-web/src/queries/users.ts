import { queryOptions } from '@tanstack/react-query';
import type { UserListQuery } from '@feed-plan/shared';
import { api } from '~/lib/api-client';

export const userQueries = {
  all: () => userQueries.list(),
  list: (query: UserListQuery = {}) =>
    queryOptions({
      queryKey: ['users', query],
      queryFn: () => api.users.list(query),
    }),
};
