import { MenuThemeEnum, MenuTypeEnum, SystemThemeEnum } from '~/enums/appEnum';
import { runThemeTransition } from '~/lib/theme-transition';
import { useSettingStore } from '~/store/modules/setting';

export function useSettingsHandlers() {
  const setMenuOpen = useSettingStore((state) => state.setMenuOpen);
  const setMenuThemeType = useSettingStore((state) => state.setMenuThemeType);
  const setMenuType = useSettingStore((state) => state.setMenuType);
  const setSystemThemeType = useSettingStore((state) => state.setSystemThemeType);

  const switchTheme = (theme: SystemThemeEnum, event?: MouseEvent) => {
    runThemeTransition(() => setSystemThemeType(theme), event);
  };

  const switchMenuLayout = (type: MenuTypeEnum) => {
    if (type === MenuTypeEnum.LEFT || type === MenuTypeEnum.TOP_LEFT || type === MenuTypeEnum.DUAL_MENU) {
      setMenuOpen(true);
    }

    if (type === MenuTypeEnum.DUAL_MENU) {
      setMenuThemeType(MenuThemeEnum.DESIGN);
    }

    setMenuType(type);
  };

  return { switchMenuLayout, switchTheme };
}
