import { ContainerWidthEnum, MenuThemeEnum, MenuTypeEnum, SystemThemeEnum } from '~/enums/appEnum';

export const SETTING_DEFAULT_CONFIG = {
  menuType: MenuTypeEnum.LEFT,
  menuOpenWidth: 230,
  menuOpen: true,
  systemThemeType: SystemThemeEnum.LIGHT,
  systemThemeColor: '#5D87FF',
  menuThemeType: MenuThemeEnum.DESIGN,
  showMenuButton: true,
  showFastEnter: true,
  showRefreshButton: true,
  showCrumbs: true,
  showWorkTab: true,
  showLanguage: true,
  showSettingGuide: true,
  showNprogress: true,
  uniqueOpened: true,
  colorWeak: false,
  watermarkVisible: false,
  boxBorderMode: true,
  tabStyle: 'tab-google',
  pageTransition: 'fade',
  customRadius: 0.75,
  containerWidth: ContainerWidthEnum.FULL,
} as const;

export function getSettingDefaults() {
  return { ...SETTING_DEFAULT_CONFIG };
}
