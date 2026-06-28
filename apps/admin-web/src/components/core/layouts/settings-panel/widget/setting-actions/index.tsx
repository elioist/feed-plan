import { Button } from 'antd';
import { useSettingsActions } from '../../hooks/use-settings-actions';
import styles from '../../styles.module.scss';

export function SettingActions() {
  const { copyConfig, resetConfig } = useSettingsActions();

  return (
    <div className={styles.actions}>
      <Button type="primary" block onClick={() => void copyConfig()}>
        复制配置
      </Button>
      <Button danger block onClick={resetConfig}>
        重置配置
      </Button>
    </div>
  );
}
