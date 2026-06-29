import { Watermark } from 'antd';
import type { PropsWithChildren } from 'react';
import { AppConfig } from '~/config';
import { useSettingStore } from '~/store/modules/setting';

interface AppWatermarkProps extends PropsWithChildren {
  isDark: boolean;
}

export function AppWatermark({ children, isDark }: AppWatermarkProps) {
  const watermarkVisible = useSettingStore((state) => state.watermarkVisible);

  if (!watermarkVisible) return children;

  return (
    <Watermark
      className="min-h-screen"
      content={AppConfig.systemInfo.name}
      font={{
        color: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
        fontSize: 16,
      }}
      gap={[100, 100]}
      offset={[50, 50]}
      rotate={-22}
      zIndex={3100}
    >
      {children}
    </Watermark>
  );
}
