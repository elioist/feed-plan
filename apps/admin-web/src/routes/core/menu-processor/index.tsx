import type { AuthMenu, MenuType } from '@feed-plan/shared';
import type { ReactNode } from 'react';
import { SvgIcon } from '~/components/core/base/svg-icon';

export type AdminRoutePath = string;

export interface AdminMenuItem {
  activeMenuKey?: string | null;
  children?: AdminMenuItem[];
  disabled?: boolean;
  externalUrl?: string | null;
  fixedTab?: boolean;
  icon: ReactNode;
  iconKey?: string;
  isCache?: boolean;
  isTabVisible?: boolean;
  key: string;
  label: string;
  menuKey?: string;
  openInNewTab?: boolean;
  path?: AdminRoutePath;
  type?: MenuType;
}

export interface ResolvedRouteMeta {
  fixedTab?: boolean;
  icon: ReactNode;
  iconKey?: string;
  isCache?: boolean;
  isTabVisible?: boolean;
  menuKey?: string;
  path: AdminRoutePath;
  title: string;
  type?: MenuType;
}

const builtinRouteMetas: Record<AdminRoutePath, ResolvedRouteMeta> = {
  '/profile': {
    icon: <SvgIcon icon="lucide:user" width={16} height={16} />,
    iconKey: 'lucide:user',
    isTabVisible: true,
    path: '/profile',
    title: '个人中心',
    type: 'page',
  },
};

function pathMatches(pathname: string, path: AdminRoutePath) {
  return path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);
}

function toMenuItem(menu: AuthMenu): AdminMenuItem | null {
  if (!menu.isVisible) return null;
  const path = menu.path ?? undefined;
  const children = menu.children.map(toMenuItem).filter((item): item is AdminMenuItem => Boolean(item));
  return {
    activeMenuKey: menu.activeMenuKey,
    ...(children.length > 0 ? { children } : {}),
    externalUrl: menu.externalUrl,
    fixedTab: menu.isAffix,
    icon: menu.icon ? <SvgIcon icon={menu.icon} width={16} height={16} /> : null,
    iconKey: menu.icon ?? undefined,
    isCache: menu.isCache,
    isTabVisible: menu.isTabVisible,
    key: path ?? menu.key,
    label: menu.title,
    menuKey: menu.key,
    openInNewTab: menu.openInNewTab,
    path,
    type: menu.type,
  };
}

export function buildMenusFromApi(apiMenus: AuthMenu[]): AdminMenuItem[] {
  return apiMenus.map(toMenuItem).filter((item): item is AdminMenuItem => Boolean(item));
}

function flattenMenuItems(items: AdminMenuItem[]): AdminMenuItem[] {
  return items.flatMap((item) => [item, ...flattenMenuItems(item.children ?? [])]);
}

export function getRoutableRouteMeta(menus: AdminMenuItem[]) {
  return flattenMenuItems(menus)
    .filter((item) => item.path && item.type !== 'directory' && item.type !== 'link')
    .map((item): ResolvedRouteMeta => ({
      fixedTab: item.fixedTab,
      icon: item.icon,
      iconKey: item.iconKey,
      isCache: item.isCache,
      isTabVisible: item.isTabVisible,
      menuKey: item.menuKey,
      path: item.path!,
      title: item.label,
      type: item.type,
    }));
}

export function getRouteMeta(pathname: string, menus: AdminMenuItem[]): ResolvedRouteMeta {
  const item = flattenMenuItems(menus).find((menu) => menu.path && pathMatches(pathname, menu.path));
  if (!item?.path) {
    const builtinMeta = builtinRouteMetas[pathname];
    if (builtinMeta) return builtinMeta;

    return {
      icon: null,
      isTabVisible: false,
      path: pathname,
      title: '页面',
    };
  }
  return {
    fixedTab: item.fixedTab,
    icon: item.icon,
    iconKey: item.iconKey,
    isCache: item.isCache,
    isTabVisible: item.isTabVisible,
    menuKey: item.menuKey,
    path: item.path,
    title: item.label,
    type: item.type,
  };
}

export function getOpenMenuKeys(pathname: string, menus: AdminMenuItem[]) {
  const result: string[] = [];
  const walk = (items: AdminMenuItem[], parents: string[]): boolean => {
    for (const item of items) {
      if (item.path && pathMatches(pathname, item.path)) {
        result.push(...parents);
        return true;
      }
      if (item.children && walk(item.children, [...parents, item.key])) return true;
    }
    return false;
  };
  walk(menus, []);
  return result;
}

export function findActiveTopKey(pathname: string, menus: AdminMenuItem[]): string | undefined {
  for (const item of menus) {
    if (item.path && pathMatches(pathname, item.path)) {
      return item.key;
    }
    if (item.children?.some((child) => child.path && pathMatches(pathname, child.path))) {
      return item.key;
    }
  }
  return undefined;
}

export function getActiveTopKey(pathname: string, menus: AdminMenuItem[]): string | undefined {
  return findActiveTopKey(pathname, menus) ?? menus[0]?.key;
}

export function getSubMenus(topKey: string | undefined, menus: AdminMenuItem[]): AdminMenuItem[] {
  if (!topKey) return [];
  const top = menus.find((item) => item.key === topKey);
  if (!top) return [];
  return top.children ?? [top];
}

export function getFirstNavigableMenu(item: AdminMenuItem): AdminMenuItem | undefined {
  if (item.type === 'link' && item.externalUrl) return item;
  if (item.path && item.type !== 'directory') return item;
  return item.children?.map(getFirstNavigableMenu).find(Boolean);
}

export function getFirstRoutableMenu(item: AdminMenuItem): AdminMenuItem | undefined {
  if (item.path && item.type !== 'directory' && item.type !== 'link') return item;
  return item.children?.map(getFirstRoutableMenu).find(Boolean);
}

export function getFirstRoutablePath(items: AdminMenuItem[]) {
  return items.map(getFirstRoutableMenu).find(Boolean)?.path ?? '/';
}

export function openExternalMenu(item: AdminMenuItem) {
  if (!item.externalUrl) return;
  if (item.openInNewTab) {
    window.open(item.externalUrl, '_blank', 'noopener,noreferrer');
    return;
  }
  window.location.href = item.externalUrl;
}
