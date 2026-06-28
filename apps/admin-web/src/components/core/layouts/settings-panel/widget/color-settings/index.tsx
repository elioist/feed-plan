import { SvgIcon } from '~/components/core/base/svg-icon';
import { AppConfig } from '~/config';
import { useSettingStore } from '~/store/modules/setting';
import styles from '../../styles.module.scss';
import { SectionTitle } from '../section-title';

export function ColorSettings() {
  const systemThemeColor = useSettingStore((state) => state.systemThemeColor);
  const setSystemThemeColor = useSettingStore((state) => state.setSystemThemeColor);

  return (
    <section className={styles.section}>
      <SectionTitle>系统主题色</SectionTitle>
      <div className={styles.colorGrid}>
        {AppConfig.systemMainColor.map((color) => (
          <button
            key={color}
            aria-label={'选择主题色 ' + color}
            className={styles.colorDot}
            style={{ backgroundColor: color }}
            type="button"
            onClick={() => setSystemThemeColor(color)}
          >
            {color === systemThemeColor ? <SvgIcon icon="ri:check-fill" /> : null}
          </button>
        ))}
      </div>
    </section>
  );
}
