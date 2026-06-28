import { useNavigate } from '@tanstack/react-router';
import type { AdminMenuItem, AdminRoutePath } from '~/routes/core/menu-processor';
import styles from './styles.module.scss';

interface BreadcrumbProps {
  fallbackTitle: string;
  menus: AdminMenuItem[];
  pathname: string;
}

type BreadcrumbItem = Pick<AdminMenuItem, 'key' | 'label' | 'path' | 'type'>;

function pathMatches(pathname: string, path: AdminRoutePath) {
  return path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);
}

function findBreadcrumbTrail(items: AdminMenuItem[], pathname: string): AdminMenuItem[] {
  for (const item of items) {
    if (item.path && pathMatches(pathname, item.path)) {
      return [item];
    }

    const childTrail = findBreadcrumbTrail(item.children ?? [], pathname);
    if (childTrail.length > 0) {
      return [item, ...childTrail];
    }
  }

  return [];
}

function isClickable(item: BreadcrumbItem, isLast: boolean) {
  return Boolean(!isLast && item.path && item.type !== 'directory' && item.type !== 'link');
}

export function Breadcrumb({ fallbackTitle, menus, pathname }: BreadcrumbProps) {
  const navigate = useNavigate();
  const trail = findBreadcrumbTrail(menus, pathname);
  const items: BreadcrumbItem[] =
    trail.length > 0 ? trail : [{ key: pathname, label: fallbackTitle, path: pathname }];

  return (
    <nav className={styles.breadcrumb} aria-label="breadcrumb">
      <ol>
        <li>
          <span>后台</span>
        </li>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          const clickable = isClickable(item, last);

          return (
            <li key={item.key}>
              {clickable ? (
                <button type="button" onClick={() => void navigate({ to: item.path! })}>
                  {item.label}
                </button>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
