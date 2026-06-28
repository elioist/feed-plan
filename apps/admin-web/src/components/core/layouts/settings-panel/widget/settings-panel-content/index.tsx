import styles from '../../styles.module.scss';
import { BasicSettings } from '../basic-settings';
import { BoxStyleSettings } from '../box-style-settings';
import { ColorSettings } from '../color-settings';
import { ContainerSettings } from '../container-settings';
import { MenuLayoutSettings } from '../menu-layout-settings';
import { MenuStyleSettings } from '../menu-style-settings';
import { SettingActions } from '../setting-actions';
import { ThemeSettings } from '../theme-settings';

export function SettingsPanelContent() {
  return (
    <div className={styles.content}>
      <ThemeSettings />
      <MenuLayoutSettings />
      <MenuStyleSettings />
      <ColorSettings />
      <BoxStyleSettings />
      <ContainerSettings />
      <BasicSettings />
      <SettingActions />
    </div>
  );
}
