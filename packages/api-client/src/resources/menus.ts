import type {
  AccessListQuery,
  AdminMenu,
  CreateMenuButtonInput,
  CreateMenuInput,
  MenuButton,
  RoleMenuAccess,
  UpdateMenuButtonInput,
  UpdateMenuInput,
  UpdateRoleMenusInput,
} from '@feed-plan/shared';

import type { ApiRequest } from '../types.js';

export function createMenusResource(request: ApiRequest) {
  return {
    list(query?: AccessListQuery) {
      return request<AdminMenu[]>('/menus', { query });
    },
    create(input: CreateMenuInput) {
      return request<AdminMenu>('/menus', {
        method: 'POST',
        body: input,
      });
    },
    update(id: string, input: UpdateMenuInput) {
      return request<AdminMenu>(`/menus/${id}`, {
        method: 'PATCH',
        body: input,
      });
    },
    delete(id: string) {
      return request<{ ok: true }>(`/menus/${id}`, {
        method: 'DELETE',
      });
    },
    createButton(input: CreateMenuButtonInput) {
      return request<MenuButton>('/menu-buttons', {
        method: 'POST',
        body: input,
      });
    },
    updateButton(id: string, input: UpdateMenuButtonInput) {
      return request<MenuButton>(`/menu-buttons/${id}`, {
        method: 'PATCH',
        body: input,
      });
    },
    deleteButton(id: string) {
      return request<{ ok: true }>(`/menu-buttons/${id}`, {
        method: 'DELETE',
      });
    },
    getRoleAccess(roleId: string) {
      return request<RoleMenuAccess>(`/roles/${roleId}/menu-access`);
    },
    updateRoleAccess(roleId: string, input: UpdateRoleMenusInput) {
      return request<{ ok: true }>(`/roles/${roleId}/menu-access`, {
        method: 'PATCH',
        body: input,
      });
    },
  };
}
