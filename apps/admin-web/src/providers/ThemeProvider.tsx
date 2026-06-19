import { ConfigProvider, App as AntdApp, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type { PropsWithChildren } from 'react';
import { useEffect, useMemo } from 'react';
import { SystemThemeEnum } from '~/enums/appEnum';
import { useSettingStore } from '~/store/modules/setting';

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemThemeType = useSettingStore((state) => state.systemThemeType);
  const systemThemeColor = useSettingStore((state) => state.systemThemeColor);
  const customRadius = useSettingStore((state) => state.customRadius);
  const boxBorderMode = useSettingStore((state) => state.boxBorderMode);
  const isDark = systemThemeType === SystemThemeEnum.DARK;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.dataset.boxMode = boxBorderMode ? 'border-mode' : 'shadow-mode';
    root.style.setProperty('--theme-color', systemThemeColor);
    root.style.setProperty('--custom-radius', customRadius + 'rem');
  }, [boxBorderMode, customRadius, isDark, systemThemeColor]);

  const antdTheme = useMemo(
    () => ({
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: systemThemeColor,
        borderRadius: Math.round(customRadius * 10),
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      },
      components: {
        Layout: {
          bodyBg: 'var(--default-bg-color)',
          headerBg: 'var(--default-box-color)',
          siderBg: 'var(--default-box-color)',
        },
        Menu: {
          itemBorderRadius: 6,
          itemHeight: 42,
          collapsedIconSize: 18,
        },
        Card: {
          borderRadiusLG: Math.round(customRadius * 14),
        },
      },
    }),
    [customRadius, isDark, systemThemeColor],
  );

  return (
    <ConfigProvider locale={zhCN} theme={antdTheme}>
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}
