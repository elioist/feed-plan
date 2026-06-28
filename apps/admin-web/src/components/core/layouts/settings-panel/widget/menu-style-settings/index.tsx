import { Tooltip } from 'antd';
import { MenuThemeEnum, MenuTypeEnum, SystemThemeEnum } from '~/enums/appEnum';
import { useSettingStore } from '~/store/modules/setting';
import { useSettingsConfig } from '../../hooks/use-settings-config';
import styles from '../../styles.module.scss';
import { SectionTitle } from '../section-title';

export function MenuStyleSettings() {
  const menuThemeType = useSettingStore((state) => state.menuThemeType);
  const menuType = useSettingStore((state) => state.menuType);
  const systemThemeType = useSettingStore((state) => state.systemThemeType);
  const setMenuThemeType = useSettingStore((state) => state.setMenuThemeType);
  const { menuThemeOptions } = useSettingsConfig();
  const disabled =
    menuType === MenuTypeEnum.TOP ||
    menuType === MenuTypeEnum.DUAL_MENU ||
    systemThemeType === SystemThemeEnum.DARK;

  return (
    <section className={styles.section}>
      <SectionTitle>菜单风格</SectionTitle>
      <div className={styles.previewGrid}>
        {menuThemeOptions.map((item) => (
          <Tooltip key={item.theme} title={disabled ? '顶部/双列布局或深色模式下菜单风格固定' : undefined}>
            <button
              type="button"
              className={styles.previewItem}
              disabled={disabled}
              onClick={() => setMenuThemeType(item.theme as MenuThemeEnum)}
            >
              <span
                className={`${styles.previewBox} ${styles[`menu_${item.tone}`]} ${
                  menuThemeType === item.theme ? styles.active : ''
                }`}
              />
            </button>
          </Tooltip>
        ))}
      </div>
    </section>
  );
}
