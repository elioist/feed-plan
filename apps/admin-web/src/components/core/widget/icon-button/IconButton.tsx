import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { SvgIcon, type SvgIconProps } from '~/components/core/base/svg-icon';
import { cn } from '@feed-plan/shared';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: SvgIconProps['icon'];
  circle?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, circle, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center size-8.5 text-xl text-[var(--gray-600)] cursor-pointer rounded transition-all duration-300 hover:bg-[var(--hover-color)]',
          circle && 'rounded-full',
          className,
        )}
        {...props}
      >
        <SvgIcon icon={icon} />
        {children}
      </button>
    );
  },
);

IconButton.displayName = 'IconButton';
