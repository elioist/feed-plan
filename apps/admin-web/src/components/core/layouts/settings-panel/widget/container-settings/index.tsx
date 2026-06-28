import { SvgIcon } from '~/components/core/base/svg-icon';
import { ContainerWidthEnum } from '~/enums/appEnum';
import { useSettingStore } from '~/store/modules/setting';
import { useSettingsConfig } from '../../hooks/use-settings-config';
import styles from '../../styles.module.scss';
import { SectionTitle } from '../section-title';

export function ContainerSettings() {
  const containerWidth = useSettingStore((state) => state.containerWidth);
  const setContainerWidth = useSettingStore((state) => state.setContainerWidth);
  const { containerWidthOptions } = useSettingsConfig();

  return (
    <section className={styles.section}>
      <SectionTitle>容器宽度</SectionTitle>
      <div className={styles.containerOptions}>
        {containerWidthOptions.map((item) => (
          <button
            key={item.value}
            type="button"
            className={containerWidth === item.value ? styles.containerActive : undefined}
            onClick={() => setContainerWidth(item.value as ContainerWidthEnum)}
          >
            <SvgIcon icon={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
