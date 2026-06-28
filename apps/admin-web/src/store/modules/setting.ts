import { adminStorageNS } from '@feed-plan/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SETTING_DEFAULT_CONFIG } from '~/config/setting';
import { ContainerWidthEnum, MenuThemeEnum, MenuTypeEnum, SystemThemeEnum } from '~/enums/appEnum';

export interface SettingState {
  menuType: MenuTypeEnum;
  menuOpenWidth: number;
  menuOpen: boolean;
  systemThemeType: SystemThemeEnum;
  systemThemeColor: string;
  menuThemeType: MenuThemeEnum;
  showMenuButton: boolean;
  showFastEnter: boolean;
  showRefreshButton: boolean;
  showCrumbs: boolean;
  showWorkTab: boolean;
  showLanguage: boolean;
  showSettingGuide: boolean;
  showNprogress: boolean;
  uniqueOpened: boolean;
  colorWeak: boolean;
  watermarkVisible: boolean;
  boxBorderMode: boolean;
  tabStyle: string;
  pageTransition: string;
  customRadius: number;
  containerWidth: ContainerWidthEnum;
  refreshToken: number;
  setMenuOpen: (open: boolean) => void;
  toggleMenuOpen: () => void;
  reload: () => void;
  setSystemThemeType: (theme: SystemThemeEnum) => void;
  toggleTheme: () => void;
  setSystemThemeColor: (color: string) => void;
  setBoxBorderMode: (enabled: boolean) => void;
  setContainerWidth: (width: ContainerWidthEnum) => void;
  setCustomRadius: (radius: number) => void;
  setMenuOpenWidth: (width: number) => void;
  setShowWorkTab: (show: boolean) => void;
  setMenuType: (type: MenuTypeEnum) => void;
  setMenuThemeType: (theme: MenuThemeEnum) => void;
  setShowMenuButton: (show: boolean) => void;
  setShowRefreshButton: (show: boolean) => void;
  setShowFastEnter: (show: boolean) => void;
  setShowCrumbs: (show: boolean) => void;
  setShowLanguage: (show: boolean) => void;
  setShowNprogress: (show: boolean) => void;
  setUniqueOpened: (uniqueOpened: boolean) => void;
  setColorWeak: (colorWeak: boolean) => void;
  setWatermarkVisible: (watermarkVisible: boolean) => void;
  setTabStyle: (style: string) => void;
  setPageTransition: (transition: string) => void;
  resetSettings: () => void;
}

export const useSettingStore = create<SettingState>()(
  persist(
    (set, get) => ({
      ...SETTING_DEFAULT_CONFIG,
      refreshToken: 0,
      setMenuOpen: (open) => set({ menuOpen: open }),
      toggleMenuOpen: () => set({ menuOpen: !get().menuOpen }),
      reload: () => set((state) => ({ refreshToken: state.refreshToken + 1 })),
      setSystemThemeType: (systemThemeType) => set({ systemThemeType }),
      toggleTheme: () =>
        set((state) => ({
          systemThemeType:
            state.systemThemeType === SystemThemeEnum.DARK
              ? SystemThemeEnum.LIGHT
              : SystemThemeEnum.DARK,
        })),
      setSystemThemeColor: (systemThemeColor) => set({ systemThemeColor }),
      setBoxBorderMode: (boxBorderMode) => set({ boxBorderMode }),
      setContainerWidth: (containerWidth) => set({ containerWidth }),
      setCustomRadius: (customRadius) => set({ customRadius }),
      setMenuOpenWidth: (menuOpenWidth) => set({ menuOpenWidth }),
      setShowWorkTab: (showWorkTab) => set({ showWorkTab }),
      setMenuType: (menuType) => set({ menuType }),
      setMenuThemeType: (menuThemeType) => set({ menuThemeType }),
      setShowMenuButton: (showMenuButton) => set({ showMenuButton }),
      setShowRefreshButton: (showRefreshButton) => set({ showRefreshButton }),
      setShowFastEnter: (showFastEnter) => set({ showFastEnter }),
      setShowCrumbs: (showCrumbs) => set({ showCrumbs }),
      setShowLanguage: (showLanguage) => set({ showLanguage }),
      setShowNprogress: (showNprogress) => set({ showNprogress }),
      setUniqueOpened: (uniqueOpened) => set({ uniqueOpened }),
      setColorWeak: (colorWeak) => set({ colorWeak }),
      setWatermarkVisible: (watermarkVisible) => set({ watermarkVisible }),
      setTabStyle: (tabStyle) => set({ tabStyle }),
      setPageTransition: (pageTransition) => set({ pageTransition }),
      resetSettings: () => set({ ...SETTING_DEFAULT_CONFIG }),
    }),
    {
      name: adminStorageNS('setting'),
      partialize: (state) => ({
        menuType: state.menuType,
        menuOpenWidth: state.menuOpenWidth,
        menuOpen: state.menuOpen,
        systemThemeType: state.systemThemeType,
        systemThemeColor: state.systemThemeColor,
        menuThemeType: state.menuThemeType,
        boxBorderMode: state.boxBorderMode,
        tabStyle: state.tabStyle,
        pageTransition: state.pageTransition,
        customRadius: state.customRadius,
        containerWidth: state.containerWidth,
        showWorkTab: state.showWorkTab,
        showMenuButton: state.showMenuButton,
        showRefreshButton: state.showRefreshButton,
        showFastEnter: state.showFastEnter,
        showCrumbs: state.showCrumbs,
        showLanguage: state.showLanguage,
        showNprogress: state.showNprogress,
        uniqueOpened: state.uniqueOpened,
        colorWeak: state.colorWeak,
        watermarkVisible: state.watermarkVisible,
      }),
    },
  ),
);
