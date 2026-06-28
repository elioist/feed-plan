import { useSettingStore } from '~/store/modules/setting';
import { useSettingsConfig } from '../../hooks/use-settings-config';
import styles from '../../styles.module.scss';
import { SectionTitle } from '../section-title';

export function BoxStyleSettings() {
  const boxBorderMode = useSettingStore((state) => state.boxBorderMode);
  const setBoxBorderMode = useSettingStore((state) => state.setBoxBorderMode);
  const { boxStyleOptions } = useSettingsConfig();

  return (
    <section className={styles.section}>
      <SectionTitle>盒子样式</SectionTitle>
      <div className={styles.segmented}>
        {boxStyleOptions.map((item) => {
          const active = item.value === 'border-mode' ? boxBorderMode : !boxBorderMode;
          return (
            <button
              key={item.value}
              type="button"
              className={active ? styles.segmentedActive : undefined}
              onClick={() => setBoxBorderMode(item.value === 'border-mode')}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
