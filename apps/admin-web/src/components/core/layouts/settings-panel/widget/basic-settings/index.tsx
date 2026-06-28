import type { BasicSettingConfig } from '../../hooks/use-settings-config';
import { useSettingsConfig } from '../../hooks/use-settings-config';
import { useSettingStore } from '~/store/modules/setting';
import styles from '../../styles.module.scss';
import { SectionTitle } from '../section-title';
import { SettingItem } from '../setting-item';

function getSettingValue(key: BasicSettingConfig['key']) {
  return useSettingStore.getState()[key];
}

export function BasicSettings() {
  const state = useSettingStore();
  const { basicSettingsConfig } = useSettingsConfig();

  const updateSetting = (key: BasicSettingConfig['key'], value: boolean | number | string) => {
    const store = useSettingStore.getState();
    const actions = {
      colorWeak: store.setColorWeak,
      customRadius: store.setCustomRadius,
      menuOpenWidth: store.setMenuOpenWidth,
      pageTransition: store.setPageTransition,
      showCrumbs: store.setShowCrumbs,
      showFastEnter: store.setShowFastEnter,
      showLanguage: store.setShowLanguage,
      showMenuButton: store.setShowMenuButton,
      showNprogress: store.setShowNprogress,
      showRefreshButton: store.setShowRefreshButton,
      showWorkTab: store.setShowWorkTab,
      tabStyle: store.setTabStyle,
      uniqueOpened: store.setUniqueOpened,
      watermarkVisible: store.setWatermarkVisible,
    };

    actions[key](value as never);
  };

  return (
    <section className={styles.section}>
      <SectionTitle>基础配置</SectionTitle>
      <div className={styles.basicList}>
        {basicSettingsConfig.map((config) => (
          <SettingItem
            key={config.key}
            config={config}
            value={state[config.key] ?? getSettingValue(config.key)}
            onChange={updateSetting}
          />
        ))}
      </div>
    </section>
  );
}
