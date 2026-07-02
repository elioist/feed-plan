import { View, type ViewProps } from 'react-native';
import { cn } from '@feed-plan/shared';

type SkeletonProps = ViewProps & {
  className?: string;
};

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <View
      className={cn('animate-pulse rounded bg-border/60', className)}
      {...props}
    />
  );
}

export function SkeletonText({
  className,
  lines = 1,
  widths = ['w-full'],
}: {
  className?: string;
  lines?: number;
  widths?: string[];
}) {
  return (
    <View className={cn('gap-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={`${index}-${widths[index % widths.length]}`}
          className={cn('h-3.5 rounded-full', widths[index % widths.length])}
        />
      ))}
    </View>
  );
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <View
      className={cn('rounded-[20px] border border-border bg-surface p-4', className)}
      {...props}
    />
  );
}
