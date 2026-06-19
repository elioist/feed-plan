import { MenuThemeEnum, MenuTypeEnum, SystemThemeEnum } from '~/enums/appEnum';
import { headerBarConfig } from '~/config/modules/headerBar';

export const AppConfig = Object.freeze({
  systemInfo: {
    name: 'Feed Plan Pro',
  },
  systemThemeStyles: {
    [SystemThemeEnum.LIGHT]: { className: '' },
    [SystemThemeEnum.DARK]: { className: SystemThemeEnum.DARK },
    [SystemThemeEnum.AUTO]: { className: '' },
  },
  menuLayoutList: [
    { name: 'Left', value: MenuTypeEnum.LEFT },
    { name: 'Top', value: MenuTypeEnum.TOP },
    { name: 'Mixed', value: MenuTypeEnum.TOP_LEFT },
    { name: 'Dual Column', value: MenuTypeEnum.DUAL_MENU },
  ],
  themeList: [
    {
      theme: MenuThemeEnum.DESIGN,
      background: '#ffffff',
      systemNameColor: 'var(--gray-800)',
      iconColor: '#6b6b6b',
      textColor: '#29343d',
    },
    {
      theme: MenuThemeEnum.DARK,
      background: '#191a23',
      systemNameColor: '#d9dadb',
      iconColor: '#babbbd',
      textColor: '#babbbd',
    },
    {
      theme: MenuThemeEnum.LIGHT,
      background: '#ffffff',
      systemNameColor: 'var(--gray-800)',
      iconColor: '#6b6b6b',
      textColor: '#29343d',
    },
  ],
  systemMainColor: ['#5D87FF', '#B48DF3', '#1D84FF', '#60C041', '#38C0FC', '#F9901F', '#FF80C8'],
  headerBar: headerBarConfig,
});
