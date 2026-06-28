export const ACCESS_ACTIONS = {
  usersManage: 'system.users.manage',
  rolesManage: 'system.roles.manage',
  menusManage: 'system.menus.manage',
  recipesManage: 'recipes.dishes.manage',
  tagsManage: 'recipes.tags.manage',
  uploadsManage: 'recipes.dishes.upload',
  mealsComplete: 'meals.complete',
} as const;

export type AccessAction = (typeof ACCESS_ACTIONS)[keyof typeof ACCESS_ACTIONS];

export const MANAGEMENT_ACTIONS = [
  ACCESS_ACTIONS.usersManage,
  ACCESS_ACTIONS.rolesManage,
  ACCESS_ACTIONS.menusManage,
] as const;
