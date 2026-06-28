import type { AuthMenu } from '@feed-plan/shared';
import { describe, expect, it } from 'vitest';
import {
  buildMenusFromApi,
  findActiveTopKey,
  getActiveTopKey,
  getFirstRoutablePath,
  getOpenMenuKeys,
  getRouteMeta,
  getRoutableRouteMeta,
  getSubMenus,
} from './index';

function authMenu(overrides: Partial<AuthMenu> & Pick<AuthMenu, 'key' | 'title'>): AuthMenu {
  return {
    id: `${overrides.key}-id`,
    parentId: null,
    path: null,
    icon: null,
    type: 'page',
    componentKey: null,
    externalUrl: null,
    openInNewTab: false,
    layoutKey: 'admin',
    isCache: false,
    isTabVisible: true,
    isAffix: false,
    activeMenuKey: null,
    sortOrder: 1,
    isVisible: true,
    isSystem: true,
    buttons: [],
    children: [],
    ...overrides,
  };
}

describe('backend-driven navigation', () => {
  it('builds menu UI items from the backend route manifest', () => {
    const menus = buildMenusFromApi([
      authMenu({
        key: 'docs',
        title: '做饭文档',
        path: '/docs',
        icon: 'lucide:book-open',
        type: 'iframe',
        externalUrl: 'https://example.com/docs',
        isCache: true,
      }),
      authMenu({
        key: 'external',
        title: '外部菜谱',
        path: null,
        icon: null,
        type: 'link',
        externalUrl: 'https://example.com/recipes',
        openInNewTab: true,
      }),
    ]);

    expect(menus[0]).toMatchObject({
      key: '/docs',
      path: '/docs',
      type: 'iframe',
      externalUrl: 'https://example.com/docs',
      isCache: true,
    });
    expect(menus[1]).toMatchObject({
      key: 'external',
      type: 'link',
      externalUrl: 'https://example.com/recipes',
      openInNewTab: true,
    });
  });

  it('omits empty children from backend leaf menus', () => {
    const menus = buildMenusFromApi([
      authMenu({
        key: 'recipes.dishes',
        title: '菜谱管理',
        path: '/dishes',
        componentKey: 'recipes.dishes',
        children: [],
      }),
    ]);

    expect(menus[0]).toMatchObject({
      key: '/dishes',
      path: '/dishes',
      menuKey: 'recipes.dishes',
      type: 'page',
    });
    expect(menus[0]).not.toHaveProperty('children');
  });

  it('keeps the backend-authorized tree intact without frontend action filtering', () => {
    const menus = buildMenusFromApi([
      authMenu({
        key: 'recipes',
        title: '菜谱中心',
        type: 'directory',
        children: [
          authMenu({
            key: 'recipes.dishes',
            title: '菜谱管理',
            path: '/dishes',
            componentKey: 'recipes.dishes',
          }),
        ],
      }),
    ]);

    expect(menus.map((item) => item.label)).toEqual(['菜谱中心']);
    expect(menus[0]?.children?.map((item) => item.label)).toEqual(['菜谱管理']);
    expect(getFirstRoutablePath(menus)).toBe('/dishes');
  });

  it('derives active keys and route meta from the backend menus', () => {
    const menus = buildMenusFromApi([
      authMenu({
        key: 'dashboard',
        title: '主厨首页',
        path: '/',
        icon: 'lucide:layout-dashboard',
        componentKey: 'dashboard',
        isAffix: true,
      }),
      authMenu({
        key: 'recipes',
        title: '菜谱中心',
        type: 'directory',
        children: [
          authMenu({
            key: 'recipes.dishes',
            title: '菜谱管理',
            path: '/dishes',
            componentKey: 'recipes.dishes',
            isCache: true,
          }),
        ],
      }),
    ]);

    expect(findActiveTopKey('/dishes', menus)).toBe('recipes');
    expect(getActiveTopKey('/unknown', menus)).toBe('/');
    expect(getOpenMenuKeys('/dishes/123', menus)).toEqual(['recipes']);
    expect(getSubMenus('recipes', menus).map((item) => item.label)).toEqual(['菜谱管理']);
    expect(getRouteMeta('/dishes', menus)).toMatchObject({
      isCache: true,
      menuKey: 'recipes.dishes',
      path: '/dishes',
      title: '菜谱管理',
      type: 'page',
    });
    expect(getRoutableRouteMeta(menus).map((item) => item.path)).toEqual(['/', '/dishes']);
  });

  it('does not invent fallback menus when the backend returns no menus', () => {
    expect(getActiveTopKey('/', [])).toBeUndefined();
    expect(getOpenMenuKeys('/', [])).toEqual([]);
    expect(getSubMenus(undefined, [])).toEqual([]);
    expect(getRoutableRouteMeta([])).toEqual([]);
    expect(getRouteMeta('/profile', [])).toMatchObject({
      isTabVisible: false,
      path: '/profile',
      title: '页面',
    });
  });
});
