import { Link } from '@tanstack/react-router';
import type { ItemType } from 'antd/es/menu/interface';
import type { AdminMenuItem } from '~/components/core/layouts/navigation';

/** 把导航树转成 antd Menu 的 items（path 项渲染为路由 Link） */
export function toMenuItems(items: AdminMenuItem[]): ItemType[] {
  return items.map((item) => ({
    key: item.key,
    icon: item.icon,
    disabled: item.disabled,
    label: item.path ? <Link to={item.path}>{item.label}</Link> : item.label,
    children: item.children?.map((child) => toMenuItems([child])[0]!),
  }));
}
