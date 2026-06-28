import { Empty, Input, List, Modal, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { SvgIcon } from '~/components/core/base/svg-icon';
import type { AdminRoutePath, ResolvedRouteMeta } from '~/routes/core/menu-processor';
import styles from './styles.module.scss';

interface GlobalSearchProps {
  routes: ResolvedRouteMeta[];
  onOpenRoute: (path: AdminRoutePath) => void | Promise<void>;
}

export function GlobalSearch({ routes, onOpenRoute }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');

  const filteredRoutes = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return routes;

    return routes.filter((route) => {
      return (
        route.title.toLowerCase().includes(normalizedKeyword) ||
        route.path.toLowerCase().includes(normalizedKeyword)
      );
    });
  }, [routes, keyword]);

  const close = () => {
    setOpen(false);
    setKeyword('');
  };

  const openRoute = async (path: AdminRoutePath) => {
    close();
    await onOpenRoute(path);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <Input
        className={styles.trigger}
        prefix={<SvgIcon icon="ri:search-line" />}
        placeholder="搜索"
        suffix={<span className={styles.kbd}>⌘ K</span>}
        readOnly
        onClick={() => setOpen(true)}
      />
      <Modal
        title="全局搜索"
        open={open}
        width={560}
        footer={null}
        destroyOnHidden
        focusable={{ focusTriggerAfterClose: false }}
        onCancel={close}
      >
        <Input
          autoFocus
          prefix={<SvgIcon icon="ri:search-line" />}
          placeholder="搜索页面或功能"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        {filteredRoutes.length > 0 ? (
          <List
            className={styles.list}
            dataSource={filteredRoutes}
            renderItem={(route) => (
              <List.Item
                actions={[<Tag key="path">{route.path}</Tag>]}
                className={styles.item}
                onClick={() => void openRoute(route.path)}
              >
                <List.Item.Meta avatar={route.icon} title={route.title} description={route.path} />
              </List.Item>
            )}
          />
        ) : (
          <Empty className={styles.empty} description="没有匹配的页面" />
        )}
      </Modal>
    </>
  );
}
