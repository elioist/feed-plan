import { App as AntdApp, ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type { ThemeConfig } from 'antd';
import type { PropsWithChildren } from 'react';
import { useLayoutEffect, useMemo } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { SystemThemeEnum } from '~/enums/appEnum';
import { useSettingStore } from '~/store/modules/setting';
import { AppWatermark } from './app-watermark';

function toAntdRadius(radius: number, scale: number) {
  return Math.round(radius * scale);
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemThemeType = useSettingStore((state) => state.systemThemeType);
  const systemThemeColor = useSettingStore((state) => state.systemThemeColor);
  const customRadius = useSettingStore((state) => state.customRadius);
  const boxBorderMode = useSettingStore((state) => state.boxBorderMode);
  const colorWeak = useSettingStore((state) => state.colorWeak);
  const pageTransition = useSettingStore((state) => state.pageTransition);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', {
    defaultValue: false,
    initializeWithValue: true,
  });
  const isDark =
    systemThemeType === SystemThemeEnum.DARK ||
    (systemThemeType === SystemThemeEnum.AUTO && prefersDark);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.classList.toggle('color-weak', colorWeak);
    root.dataset.boxMode = boxBorderMode ? 'border-mode' : 'shadow-mode';
    root.dataset.pageTransition = pageTransition;
    root.style.setProperty('--theme-color', systemThemeColor);
    root.style.setProperty('--custom-radius', `${customRadius}rem`);
  }, [boxBorderMode, colorWeak, customRadius, isDark, pageTransition, systemThemeColor]);

  const antdTheme = useMemo<ThemeConfig>(
    () => ({
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        borderRadius: toAntdRadius(customRadius, 10),
        colorPrimary: systemThemeColor,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      },
      components: {
        Card: {
          borderRadiusLG: toAntdRadius(customRadius, 14),
        },
        Layout: {
          bodyBg: 'var(--default-bg-color)',
          headerBg: 'var(--default-box-color)',
          siderBg: 'var(--default-box-color)',
        },
        Menu: {
          collapsedIconSize: 18,
          itemBorderRadius: 6,
          itemHeight: 42,
        },
      },
    }),
    [customRadius, isDark, systemThemeColor],
  );

  return (
    <ConfigProvider locale={zhCN} theme={antdTheme}>
      <AntdApp>
        <AppWatermark isDark={isDark}>{children}</AppWatermark>
      </AntdApp>
    </ConfigProvider>
  );
}
