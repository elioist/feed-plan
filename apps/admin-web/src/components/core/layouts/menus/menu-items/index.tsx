import { Link } from '@tanstack/react-router';
import type { ItemType } from 'antd/es/menu/interface';
import { openExternalMenu, type AdminMenuItem } from '~/routes/core/menu-processor';
import './styles.css';

/** 把导航树转成 antd Menu 的 items（path 项渲染为路由 Link） */
export function toMenuItems(items: AdminMenuItem[]): ItemType[] {
  return items.map((item) => {
    const children = item.children?.map((child) => toMenuItems([child])[0]!);
    const label =
      item.type === 'link' && item.externalUrl ? (
        <button className="menu-link-button" type="button" onClick={() => openExternalMenu(item)}>
          {item.label}
        </button>
      ) : item.path ? (
        <Link to={item.path}>{item.label}</Link>
      ) : (
        item.label
      );

    return {
      key: item.key,
      icon: item.icon,
      disabled: item.disabled,
      label,
      ...(children && children.length > 0 ? { children } : {}),
    };
  });
}
