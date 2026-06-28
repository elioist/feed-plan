import { ConfigProvider, App as AntdApp, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type { PropsWithChildren } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { SystemThemeEnum } from '~/enums/appEnum';
import { useSettingStore } from '~/store/modules/setting';

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemThemeType = useSettingStore((state) => state.systemThemeType);
  const systemThemeColor = useSettingStore((state) => state.systemThemeColor);
  const customRadius = useSettingStore((state) => state.customRadius);
  const boxBorderMode = useSettingStore((state) => state.boxBorderMode);
  const colorWeak = useSettingStore((state) => state.colorWeak);
  const pageTransition = useSettingStore((state) => state.pageTransition);
  const watermarkVisible = useSettingStore((state) => state.watermarkVisible);
  const [prefersDark, setPrefersDark] = useState(false);
  const isDark =
    systemThemeType === SystemThemeEnum.DARK ||
    (systemThemeType === SystemThemeEnum.AUTO && prefersDark);

  useEffect(() => {
    if (!window.matchMedia) return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDark(media.matches);

    const updatePreference = (event: MediaQueryListEvent) => setPrefersDark(event.matches);
    media.addEventListener('change', updatePreference);
    return () => media.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.classList.toggle('color-weak', colorWeak);
    root.dataset.boxMode = boxBorderMode ? 'border-mode' : 'shadow-mode';
    root.dataset.pageTransition = pageTransition;
    root.style.setProperty('--theme-color', systemThemeColor);
    root.style.setProperty('--custom-radius', customRadius + 'rem');
  }, [boxBorderMode, colorWeak, customRadius, isDark, pageTransition, systemThemeColor]);

  useEffect(() => {
    const watermarkId = 'admin-settings-watermark';
    const existing = document.getElementById(watermarkId);

    if (!watermarkVisible) {
      existing?.remove();
      return;
    }

    const watermark = existing ?? document.createElement('div');
    watermark.id = watermarkId;
    watermark.setAttribute('aria-hidden', 'true');
    watermark.style.pointerEvents = 'none';
    watermark.style.position = 'fixed';
    watermark.style.inset = '0';
    watermark.style.zIndex = '9999';
    watermark.style.opacity = isDark ? '0.08' : '0.06';
    watermark.style.backgroundImage =
      'repeating-linear-gradient(-24deg, transparent 0 72px, currentColor 72px 73px, transparent 73px 144px)';
    watermark.style.color = systemThemeColor;

    if (!existing) {
      document.body.appendChild(watermark);
    }

    return () => {
      document.getElementById(watermarkId)?.remove();
    };
  }, [isDark, systemThemeColor, watermarkVisible]);

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
