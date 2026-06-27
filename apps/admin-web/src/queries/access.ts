import { queryOptions } from '@tanstack/react-query';
import type { AccessListQuery } from '@feed-plan/shared';
import { api } from '~/lib/api-client';

export const accessQueries = {
  roles: (query: AccessListQuery = {}) =>
    queryOptions({
      queryKey: ['roles', query],
      queryFn: () => api.roles.list(query),
    }),
  permissions: (query: AccessListQuery = {}) =>
    queryOptions({
      queryKey: ['permissions', query],
      queryFn: () => api.permissions.list(query),
    }),
  menus: (query: AccessListQuery = {}) =>
    queryOptions({
      queryKey: ['menus', query],
      queryFn: () => api.menus.list(query),
    }),
  roleMenuAccess: (roleId: string) =>
    queryOptions({
      queryKey: ['roles', roleId, 'menu-access'],
      queryFn: () => api.menus.getRoleAccess(roleId),
    }),
};
