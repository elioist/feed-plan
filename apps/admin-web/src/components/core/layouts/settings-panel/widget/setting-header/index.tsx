import { Button } from 'antd';
import { SvgIcon } from '~/components/core/base/svg-icon';
import styles from '../../styles.module.scss';

interface SettingHeaderProps {
  onClose: () => void;
}

export function SettingHeader({ onClose }: SettingHeaderProps) {
  return (
    <div className={styles.header}>
      <strong>系统设置</strong>
      <Button
        type="text"
        aria-label="关闭设置面板"
        icon={<SvgIcon icon="ri:close-fill" />}
        onClick={onClose}
      />
    </div>
  );
}
