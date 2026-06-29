import { Drawer } from 'antd';
import type { PropsWithChildren } from 'react';
import styles from '../../styles.module.scss';

interface SettingDrawerProps extends PropsWithChildren {
  onClose: () => void;
  open: boolean;
}

export function SettingDrawer({ children, onClose, open }: SettingDrawerProps) {
  return (
    <Drawer
      open={open}
      size={300}
      onClose={onClose}
      destroyOnHidden={false}
      closable={false}
      rootClassName={styles.drawerRoot}
      className={styles.drawer}
    >
      {children}
    </Drawer>
  );
}
