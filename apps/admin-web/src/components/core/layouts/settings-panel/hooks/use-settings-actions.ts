import { App } from 'antd';
import { useSettingStore, type SettingState } from '~/store/modules/setting';

type SettingSnapshot = Pick<
  SettingState,
  | 'boxBorderMode'
  | 'colorWeak'
  | 'containerWidth'
  | 'customRadius'
  | 'menuOpen'
  | 'menuOpenWidth'
  | 'menuThemeType'
  | 'menuType'
  | 'pageTransition'
  | 'showCrumbs'
  | 'showFastEnter'
  | 'showLanguage'
  | 'showMenuButton'
  | 'showNprogress'
  | 'showRefreshButton'
  | 'showSettingGuide'
  | 'showWorkTab'
  | 'systemThemeColor'
  | 'systemThemeType'
  | 'tabStyle'
  | 'uniqueOpened'
  | 'watermarkVisible'
>;

const CONFIG_KEYS: Array<keyof SettingSnapshot> = [
  'menuType',
  'menuOpenWidth',
  'menuOpen',
  'systemThemeType',
  'menuThemeType',
  'systemThemeColor',
  'showMenuButton',
  'showFastEnter',
  'showRefreshButton',
  'showCrumbs',
  'showWorkTab',
  'showLanguage',
  'showNprogress',
  'showSettingGuide',
  'uniqueOpened',
  'colorWeak',
  'watermarkVisible',
  'boxBorderMode',
  'pageTransition',
  'tabStyle',
  'customRadius',
  'containerWidth',
];

function formatValue(value: unknown) {
  if (typeof value === 'string') return `'${value}'`;
  return JSON.stringify(value);
}

function generateConfigCode(snapshot: SettingSnapshot) {
  const lines = ['export const SETTING_DEFAULT_CONFIG = {'];
  CONFIG_KEYS.forEach((key) => {
    lines.push(`  ${key}: ${formatValue(snapshot[key])},`);
  });
  lines.push('} as const;');
  return lines.join('\n');
}

export function useSettingsActions() {
  const { message } = App.useApp();
  const resetSettings = useSettingStore((state) => state.resetSettings);

  const copyConfig = async () => {
    try {
      const state = useSettingStore.getState();
      const snapshot = CONFIG_KEYS.reduce((result, key) => {
        result[key] = state[key] as never;
        return result;
      }, {} as SettingSnapshot);

      await navigator.clipboard.writeText(generateConfigCode(snapshot));
      message.success('配置已复制到剪贴板，可粘贴到 src/config/setting.ts 文件中');
    } catch {
      message.error('复制失败，请检查浏览器剪贴板权限');
    }
  };

  const resetConfig = () => {
    resetSettings();
    message.success('已恢复默认设置');
  };

  return { copyConfig, resetConfig };
}
