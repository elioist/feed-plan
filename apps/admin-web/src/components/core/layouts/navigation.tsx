import {
  AppstoreOutlined,
  BookOutlined,
  HomeOutlined,
  NotificationOutlined,
  ReadOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';

export type AdminRoutePath = '/' | '/categories' | '/dishes' | '/meals';

export interface AdminMenuItem {
  key: string;
  label: string;
  icon: ReactNode;
  path?: AdminRoutePath;
  disabled?: boolean;
  children?: AdminMenuItem[];
}

export interface AdminRouteMeta {
  path: AdminRoutePath;
  title: string;
  group: string;
  icon: ReactNode;
  fixedTab?: boolean;
}

export const adminRoutes: AdminRouteMeta[] = [
  { path: '/', title: '仪表盘', group: '首页', icon: <HomeOutlined />, fixedTab: true },
  { path: '/categories', title: '分类管理', group: '菜谱中心', icon: <AppstoreOutlined /> },
  { path: '/dishes', title: '菜谱管理', group: '菜谱中心', icon: <BookOutlined /> },
  { path: '/meals', title: '点菜菜单', group: '点菜管理', icon: <ReadOutlined /> },
];

export const homeRoute = adminRoutes[0]!;

export const adminMenus: AdminMenuItem[] = [
  { key: '/', icon: <HomeOutlined />, label: '仪表盘', path: '/' },
  {
    key: 'recipes',
    icon: <BookOutlined />,
    label: '菜谱中心',
    children: [
      { key: '/categories', icon: <AppstoreOutlined />, label: '分类管理', path: '/categories' },
      { key: '/dishes', icon: <BookOutlined />, label: '菜谱管理', path: '/dishes' },
    ],
  },
  { key: '/meals', icon: <ReadOutlined />, label: '点菜菜单', path: '/meals' },
  {
    key: 'system',
    icon: <UserOutlined />,
    label: '系统管理',
    children: [
      { key: '/users', icon: <UserOutlined />, label: '用户管理', disabled: true },
      { key: '/roles', icon: <SettingOutlined />, label: '角色管理', disabled: true },
      { key: '/settings', icon: <SettingOutlined />, label: '系统设置', disabled: true },
    ],
  },
  { key: 'docs', icon: <NotificationOutlined />, label: '官方文档', disabled: true },
];

export function getRouteMeta(pathname: string) {
  return (
    adminRoutes.find((item) => {
      return item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
    }) ?? homeRoute
  );
}

export function getOpenMenuKeys(pathname: string) {
  if (pathname.startsWith('/categories') || pathname.startsWith('/dishes')) {
    return ['recipes', 'system'];
  }

  return ['system'];
}
