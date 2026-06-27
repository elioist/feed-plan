import {
  AppstoreOutlined,
  BookOutlined,
  HomeOutlined,
  MenuOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TagsOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';

export type AdminRoutePath =
  | '/'
  | '/categories'
  | '/dishes'
  | '/tags'
  | '/meals'
  | '/users'
  | '/roles'
  | '/permissions'
  | '/menus'
  | '/settings';

export interface AdminMenuItem {
  key: string;
  label: string;
  icon: ReactNode;
  path?: AdminRoutePath;
  menuKey?: string;
  requiredAction?: string;
  disabled?: boolean;
  children?: AdminMenuItem[];
}

export interface AdminRouteMeta {
  path: AdminRoutePath;
  title: string;
  group: string;
  icon: ReactNode;
  menuKey?: string;
  requiredAction?: string;
  fixedTab?: boolean;
}

export const MENU_ACTIONS = {
  mealsComplete: 'meals.complete',
  permissionsManage: 'permissions.manage',
  menusManage: 'menus.manage',
  recipesManage: 'recipes.manage',
  rolesManage: 'roles.manage',
  tagsManage: 'tags.manage',
  usersManage: 'users.manage',
} as const;

export const adminRoutes: AdminRouteMeta[] = [
  { path: '/', title: '仪表盘', group: '首页', icon: <HomeOutlined />, menuKey: 'dashboard', fixedTab: true },
  {
    path: '/categories',
    title: '分类管理',
    group: '菜谱中心',
    icon: <AppstoreOutlined />,
    menuKey: 'recipes.categories',
    requiredAction: MENU_ACTIONS.recipesManage,
  },
  {
    path: '/dishes',
    title: '菜谱管理',
    group: '菜谱中心',
    icon: <BookOutlined />,
    menuKey: 'recipes.dishes',
    requiredAction: MENU_ACTIONS.recipesManage,
  },
  {
    path: '/tags',
    title: '标签管理',
    group: '菜谱中心',
    icon: <TagsOutlined />,
    menuKey: 'recipes.tags',
    requiredAction: MENU_ACTIONS.tagsManage,
  },
  {
    path: '/meals',
    title: '点菜菜单',
    group: '点菜管理',
    icon: <ReadOutlined />,
    menuKey: 'meals',
    requiredAction: MENU_ACTIONS.mealsComplete,
  },
  {
    path: '/users',
    title: '用户管理',
    group: '系统管理',
    icon: <UserOutlined />,
    menuKey: 'system.users',
    requiredAction: MENU_ACTIONS.usersManage,
  },
  {
    path: '/roles',
    title: '角色管理',
    group: '系统管理',
    icon: <TeamOutlined />,
    menuKey: 'system.roles',
    requiredAction: MENU_ACTIONS.rolesManage,
  },
  {
    path: '/permissions',
    title: '权限点管理',
    group: '系统管理',
    icon: <SafetyCertificateOutlined />,
    menuKey: 'system.permissions',
    requiredAction: MENU_ACTIONS.permissionsManage,
  },
  {
    path: '/menus',
    title: '菜单管理',
    group: '系统管理',
    icon: <MenuOutlined />,
    menuKey: 'system.menus',
    requiredAction: MENU_ACTIONS.menusManage,
  },
  {
    path: '/settings',
    title: '系统设置',
    group: '系统管理',
    icon: <SettingOutlined />,
    menuKey: 'system.settings',
  },
];

export const homeRoute = adminRoutes[0]!;

export const adminMenus: AdminMenuItem[] = [
  { key: '/', icon: <HomeOutlined />, label: '仪表盘', path: '/', menuKey: 'dashboard' },
  {
    key: 'recipes',
    icon: <BookOutlined />,
    label: '菜谱中心',
    menuKey: 'recipes',
    children: [
      {
        key: '/categories',
        icon: <AppstoreOutlined />,
        label: '分类管理',
        path: '/categories',
        menuKey: 'recipes.categories',
        requiredAction: MENU_ACTIONS.recipesManage,
      },
      {
        key: '/dishes',
        icon: <BookOutlined />,
        label: '菜谱管理',
        path: '/dishes',
        menuKey: 'recipes.dishes',
        requiredAction: MENU_ACTIONS.recipesManage,
      },
      {
        key: '/tags',
        icon: <TagsOutlined />,
        label: '标签管理',
        path: '/tags',
        menuKey: 'recipes.tags',
        requiredAction: MENU_ACTIONS.tagsManage,
      },
    ],
  },
  {
    key: '/meals',
    icon: <ReadOutlined />,
    label: '点菜菜单',
    path: '/meals',
    menuKey: 'meals',
    requiredAction: MENU_ACTIONS.mealsComplete,
  },
  {
    key: 'system',
    icon: <UserOutlined />,
    label: '系统管理',
    menuKey: 'system',
    children: [
      {
        key: '/users',
        icon: <UserOutlined />,
        label: '用户管理',
        path: '/users',
        menuKey: 'system.users',
        requiredAction: MENU_ACTIONS.usersManage,
      },
      {
        key: '/roles',
        icon: <TeamOutlined />,
        label: '角色管理',
        path: '/roles',
        menuKey: 'system.roles',
        requiredAction: MENU_ACTIONS.rolesManage,
      },
      {
        key: '/permissions',
        icon: <SafetyCertificateOutlined />,
        label: '权限点管理',
        path: '/permissions',
        menuKey: 'system.permissions',
        requiredAction: MENU_ACTIONS.permissionsManage,
      },
      {
        key: '/menus',
        icon: <MenuOutlined />,
        label: '菜单管理',
        path: '/menus',
        menuKey: 'system.menus',
        requiredAction: MENU_ACTIONS.menusManage,
      },
      {
        key: '/settings',
        icon: <SettingOutlined />,
        label: '系统设置',
        path: '/settings',
        menuKey: 'system.settings',
      },
    ],
  },
];

interface NavigationAccess {
  actions: string[];
  menuKeys?: string[];
}

function normalizeAccess(access: string[] | NavigationAccess): NavigationAccess {
  return Array.isArray(access) ? { actions: access } : access;
}

function canAccess(item: { menuKey?: string; requiredAction?: string }, accessInput: string[] | NavigationAccess) {
  const access = normalizeAccess(accessInput);
  if (Array.isArray(access.menuKeys)) {
    return !item.menuKey || access.menuKeys.includes(item.menuKey);
  }
  return !item.requiredAction || access.actions.includes(item.requiredAction);
}

export function getAuthorizedRoutes(access: string[] | NavigationAccess) {
  return adminRoutes.filter((route) => canAccess(route, access));
}

export function getAuthorizedMenus(access: string[] | NavigationAccess) {
  return adminMenus
    .map((item) => {
      const children = item.children?.filter((child) => canAccess(child, access));
      if (item.children) {
        return children && children.length > 0 ? { ...item, children } : null;
      }
      return canAccess(item, access) ? item : null;
    })
    .filter((item): item is AdminMenuItem => Boolean(item));
}

export function getRouteMeta(pathname: string) {
  return (
    adminRoutes.find((item) => {
      return item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
    }) ?? homeRoute
  );
}

export function getOpenMenuKeys(pathname: string) {
  if (pathname.startsWith('/categories') || pathname.startsWith('/dishes') || pathname.startsWith('/tags')) {
    return ['recipes'];
  }

  return ['system'];
}

function pathMatches(pathname: string, path: AdminRoutePath) {
  return path === '/' ? pathname === '/' : pathname.startsWith(path);
}

/** 当前路径所属的一级菜单 key（用于混合/双列布局确定激活分组） */
export function getActiveTopKey(pathname: string, menus: AdminMenuItem[] = adminMenus): string {
  for (const item of menus) {
    if (item.path && pathMatches(pathname, item.path)) {
      return item.key;
    }
    if (item.children?.some((child) => child.path && pathMatches(pathname, child.path))) {
      return item.key;
    }
  }
  return menus[0]?.key ?? adminMenus[0]!.key;
}

/** 指定一级菜单的子项（无子项则返回自身，供二级菜单渲染） */
export function getSubMenus(topKey: string, menus: AdminMenuItem[] = adminMenus): AdminMenuItem[] {
  const top = menus.find((item) => item.key === topKey);
  if (!top) {
    return [];
  }
  return top.children ?? [top];
}
