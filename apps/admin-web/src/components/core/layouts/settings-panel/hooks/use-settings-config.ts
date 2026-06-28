import { AppConfig } from '~/config';
import { ContainerWidthEnum, MenuThemeEnum, MenuTypeEnum, SystemThemeEnum } from '~/enums/appEnum';

export type BasicSettingType = 'switch' | 'number' | 'select';

export interface BasicSettingConfig {
  key:
    | 'showWorkTab'
    | 'uniqueOpened'
    | 'showMenuButton'
    | 'showFastEnter'
    | 'showRefreshButton'
    | 'showCrumbs'
    | 'showLanguage'
    | 'showNprogress'
    | 'colorWeak'
    | 'watermarkVisible'
    | 'menuOpenWidth'
    | 'tabStyle'
    | 'pageTransition'
    | 'customRadius';
  label: string;
  max?: number;
  min?: number;
  options?: Array<{ label: string; value: number | string }>;
  step?: number;
  type: BasicSettingType;
}

export function useSettingsConfig() {
  const themeStyleOptions = [
    { label: '浅色', value: SystemThemeEnum.LIGHT, tone: 'light' },
    { label: '深色', value: SystemThemeEnum.DARK, tone: 'dark' },
    { label: '系统', value: SystemThemeEnum.AUTO, tone: 'auto' },
  ];

  const menuLayoutLabels: Record<MenuTypeEnum, string> = {
    [MenuTypeEnum.LEFT]: '垂直',
    [MenuTypeEnum.TOP]: '水平',
    [MenuTypeEnum.TOP_LEFT]: '混合',
    [MenuTypeEnum.DUAL_MENU]: '双列',
  };

  const menuLayoutOptions = AppConfig.menuLayoutList.map((item) => ({
    ...item,
    name: menuLayoutLabels[item.value],
    tone:
      item.value === MenuTypeEnum.LEFT
        ? 'left'
        : item.value === MenuTypeEnum.TOP
          ? 'top'
          : item.value === MenuTypeEnum.TOP_LEFT
            ? 'mixed'
            : 'dual',
  }));

  const menuThemeOptions = [
    { label: '设计', theme: MenuThemeEnum.DESIGN, tone: 'design' },
    { label: '浅色', theme: MenuThemeEnum.LIGHT, tone: 'light' },
    { label: '深色', theme: MenuThemeEnum.DARK, tone: 'dark' },
  ];

  const containerWidthOptions = [
    { icon: 'ri:fullscreen-line', label: '铺满', value: ContainerWidthEnum.FULL },
    { icon: 'ri:layout-left-line', label: '定宽', value: ContainerWidthEnum.BOXED },
  ];

  const boxStyleOptions = [
    { label: '边框', value: 'border-mode' as const },
    { label: '阴影', value: 'shadow-mode' as const },
  ];

  const tabStyleOptions = [
    { label: '默认', value: 'tab-default' },
    { label: '卡片', value: 'tab-card' },
    { label: '谷歌', value: 'tab-google' },
  ];

  const pageTransitionOptions = [
    { label: '无动画', value: '' },
    { label: '淡入淡出', value: 'fade' },
    { label: '左侧滑入', value: 'slide-left' },
    { label: '下方滑入', value: 'slide-bottom' },
    { label: '上方滑入', value: 'slide-top' },
  ];

  const customRadiusOptions = [
    { label: '0', value: 0 },
    { label: '0.25', value: 0.25 },
    { label: '0.5', value: 0.5 },
    { label: '0.75', value: 0.75 },
    { label: '1', value: 1 },
  ];

  const basicSettingsConfig: BasicSettingConfig[] = [
    { key: 'showWorkTab', label: '开启多标签栏', type: 'switch' },
    { key: 'uniqueOpened', label: '侧边栏开启手风琴模式', type: 'switch' },
    { key: 'showMenuButton', label: '显示折叠侧边栏按钮', type: 'switch' },
    { key: 'showFastEnter', label: '显示快速入口', type: 'switch' },
    { key: 'showRefreshButton', label: '显示重载页面按钮', type: 'switch' },
    { key: 'showCrumbs', label: '显示全局面包屑导航', type: 'switch' },
    { key: 'showLanguage', label: '显示多语言选择', type: 'switch' },
    { key: 'showNprogress', label: '显示顶部进度条', type: 'switch' },
    { key: 'colorWeak', label: '色弱模式', type: 'switch' },
    { key: 'watermarkVisible', label: '全局水印', type: 'switch' },
    { key: 'menuOpenWidth', label: '菜单宽度', max: 320, min: 180, step: 10, type: 'number' },
    { key: 'tabStyle', label: '标签页风格', options: tabStyleOptions, type: 'select' },
    {
      key: 'pageTransition',
      label: '页面切换动画',
      options: pageTransitionOptions,
      type: 'select',
    },
    { key: 'customRadius', label: '圆角大小', options: customRadiusOptions, type: 'select' },
  ];

  return {
    basicSettingsConfig,
    boxStyleOptions,
    containerWidthOptions,
    customRadiusOptions,
    menuLayoutOptions,
    menuThemeOptions,
    pageTransitionOptions,
    tabStyleOptions,
    themeStyleOptions,
  };
}
