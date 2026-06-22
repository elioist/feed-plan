import { Icon, type IconProps } from '@iconify/react';
import { cn } from '~/lib/utils';

export interface SvgIconProps extends Omit<IconProps, 'icon'> {
  /** Iconify 图标名，如 "ri:arrow-up-wide-line" */
  icon?: string;
}

/**
 * 图标组件：薄封装 @iconify/react 的 Icon。
 * 参考 art-design-pro 的 ArtSvgIcon 实现。
 */
export function SvgIcon({ icon, className, ...rest }: SvgIconProps) {
  if (!icon) {
    return null;
  }

  return <Icon className={cn('art-svg-icon inline', className)} icon={icon} {...rest} />;
}
