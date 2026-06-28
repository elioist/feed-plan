import { MenuTypeEnum } from '~/enums/appEnum';
import { useSettingStore } from '~/store/modules/setting';
import { useSettingsConfig } from '../../hooks/use-settings-config';
import { useSettingsHandlers } from '../../hooks/use-settings-handlers';
import styles from '../../styles.module.scss';
import { SectionTitle } from '../section-title';

export function MenuLayoutSettings() {
  const menuType = useSettingStore((state) => state.menuType);
  const { menuLayoutOptions } = useSettingsConfig();
  const { switchMenuLayout } = useSettingsHandlers();

  return (
    <section className={styles.section}>
      <SectionTitle>菜单布局</SectionTitle>
      <div className={styles.previewGrid}>
        {menuLayoutOptions.map((item, index) => (
          <button
            key={item.value}
            type="button"
            className={`${styles.previewItem} ${index > 2 ? styles.previewItemSecondRow : ''}`}
            onClick={() => switchMenuLayout(item.value as MenuTypeEnum)}
          >
            <span
              className={`${styles.previewBox} ${styles[`layout_${item.tone}`]} ${
                menuType === item.value ? styles.active : ''
              }`}
            />
            <span>{item.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
