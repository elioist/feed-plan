import styles from './styles.module.scss';

interface AppLoadingProps {
  fullScreen?: boolean;
  text?: string;
}

export function AppLoading({ fullScreen = true, text }: AppLoadingProps) {
  return (
    <div className={`${styles.root} ${fullScreen ? styles.fullScreen : ''}`}>
      <div className={`${styles.stage} ${fullScreen ? '' : styles.compact}`}>
        <div className={`${styles.loader} ${fullScreen ? '' : styles.small}`} aria-label="页面加载中" role="status" />
        <div className={styles.label}>{text ?? (fullScreen ? '马上就好，正在加载中' : '加载中')}</div>
        {fullScreen ? <span className={styles.progress} aria-hidden="true" /> : null}
      </div>
    </div>
  );
}
