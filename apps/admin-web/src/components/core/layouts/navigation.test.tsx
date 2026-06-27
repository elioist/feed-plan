import { describe, expect, it } from 'vitest';
import { getAuthorizedMenus, getAuthorizedRoutes, MENU_ACTIONS } from './navigation';

function flattenLabels(items: ReturnType<typeof getAuthorizedMenus>): string[] {
  return items.flatMap((item) => [item.label, ...(item.children?.map((child) => child.label) ?? [])]);
}

describe('authorized navigation', () => {
  it('shows system management menus only when the user has matching actions', () => {
    const superAdminLabels = flattenLabels(
      getAuthorizedMenus([
        MENU_ACTIONS.mealsComplete,
        MENU_ACTIONS.permissionsManage,
        MENU_ACTIONS.recipesManage,
        MENU_ACTIONS.rolesManage,
        MENU_ACTIONS.usersManage,
      ]),
    );
    expect(superAdminLabels).toEqual(
      expect.arrayContaining(['用户管理', '角色管理', '权限点管理']),
    );

    const chefLabels = flattenLabels(
      getAuthorizedMenus([
        MENU_ACTIONS.mealsComplete,
        MENU_ACTIONS.recipesManage,
      ]),
    );
    expect(chefLabels).toEqual(expect.arrayContaining(['分类管理', '菜谱管理', '点菜菜单']));
    expect(chefLabels).not.toEqual(expect.arrayContaining(['用户管理', '角色管理', '权限点管理']));
  });

  it('filters command/search routes with the same action rules', () => {
    const routes = getAuthorizedRoutes([MENU_ACTIONS.recipesManage]).map((route) => route.path);

    expect(routes).toEqual(expect.arrayContaining(['/', '/categories', '/dishes', '/settings']));
    expect(routes).not.toEqual(expect.arrayContaining(['/users', '/roles', '/permissions']));
  });

  it('uses menu permissions when menuKeys are provided, even when empty', () => {
    expect(getAuthorizedMenus({ actions: [MENU_ACTIONS.usersManage], menuKeys: [] })).toEqual([]);
    expect(getAuthorizedRoutes({ actions: [MENU_ACTIONS.usersManage], menuKeys: [] })).toEqual([]);

    const labels = flattenLabels(
      getAuthorizedMenus({
        actions: [],
        menuKeys: ['dashboard', 'recipes', 'recipes.dishes'],
      }),
    );

    expect(labels).toEqual(expect.arrayContaining(['仪表盘', '菜谱中心', '菜谱管理']));
    expect(labels).not.toEqual(expect.arrayContaining(['分类管理', '用户管理']));
  });
});
