import { SystemThemeEnum } from '~/enums/appEnum';
import { useSettingStore } from '~/store/modules/setting';
import { useSettingsConfig } from '../../hooks/use-settings-config';
import { useSettingsHandlers } from '../../hooks/use-settings-handlers';
import styles from '../../styles.module.scss';
import { SectionTitle } from '../section-title';

export function ThemeSettings() {
  const systemThemeType = useSettingStore((state) => state.systemThemeType);
  const { themeStyleOptions } = useSettingsConfig();
  const { switchTheme } = useSettingsHandlers();

  return (
    <section className={styles.section}>
      <SectionTitle>主题风格</SectionTitle>
      <div className={styles.previewGrid}>
        {themeStyleOptions.map((item) => (
          <button
            key={item.value}
            type="button"
            className={styles.previewItem}
            onClick={(event) => switchTheme(item.value as SystemThemeEnum, event.nativeEvent)}
          >
            <span
              className={`${styles.previewBox} ${styles[`theme_${item.tone}`]} ${
                systemThemeType === item.value ? styles.active : ''
              }`}
            />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
