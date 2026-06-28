import { useRouterState } from '@tanstack/react-router';
import { useSettingStore } from '~/store/modules/setting';
import styles from './styles.module.scss';

export function RouteProgress() {
  const showNprogress = useSettingStore((state) => state.showNprogress);
  const loading = useRouterState({
    select: (state) => state.isLoading || state.isTransitioning || state.status === 'pending',
  });

  if (!showNprogress || !loading) return null;

  return <div className={styles.progress} aria-hidden="true" />;
}
