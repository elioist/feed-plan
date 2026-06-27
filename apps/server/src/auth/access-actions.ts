export const ACCESS_ACTIONS = {
  usersManage: 'users.manage',
  rolesManage: 'roles.manage',
  permissionsManage: 'permissions.manage',
  menusManage: 'menus.manage',
  recipesManage: 'recipes.manage',
  tagsManage: 'tags.manage',
  uploadsManage: 'uploads.manage',
  mealsComplete: 'meals.complete',
} as const;

export type AccessAction = (typeof ACCESS_ACTIONS)[keyof typeof ACCESS_ACTIONS];

export const MANAGEMENT_ACTIONS = [
  ACCESS_ACTIONS.usersManage,
  ACCESS_ACTIONS.rolesManage,
  ACCESS_ACTIONS.permissionsManage,
  ACCESS_ACTIONS.menusManage,
] as const;
