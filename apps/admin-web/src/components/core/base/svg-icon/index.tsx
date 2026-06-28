import { Icon, type IconProps } from '@iconify/react';
import { cn } from '@feed-plan/shared';

export interface SvgIconProps extends Omit<IconProps, 'icon'> {
  /** Iconify 图标名，如 "ri:arrow-up-wide-line" */
  icon?: string;
}

export function SvgIcon({ icon, className, ...rest }: SvgIconProps) {
  if (!icon) {
    return null;
  }

  return <Icon className={cn('inline', className)} icon={icon} {...rest} />;
}
