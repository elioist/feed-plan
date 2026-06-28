import { Alert } from 'antd';
import styles from './styles.module.scss';

interface IframePageProps {
  title: string;
  url: string | null;
}

export function IframePage({ title, url }: IframePageProps) {
  if (!url) {
    return <Alert type="warning" showIcon message="外链地址未配置" />;
  }

  return (
    <iframe
      className={styles.page}
      src={url}
      title={title}
      referrerPolicy="no-referrer"
      sandbox="allow-forms allow-popups allow-same-origin allow-scripts"
    />
  );
}
