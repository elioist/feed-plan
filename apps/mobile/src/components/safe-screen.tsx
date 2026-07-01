import { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@feed-plan/shared';

type SafeScreenEdge = 'top' | 'right' | 'bottom' | 'left';

interface SafeScreenProps {
  children: ReactNode;
  className?: string;
  edges?: readonly SafeScreenEdge[];
  style?: StyleProp<ViewStyle>;
}

export function SafeScreen({ children, className, edges = ['top'], style }: SafeScreenProps) {
  const insets = useSafeAreaInsets();
  const edgeSet = new Set(edges);

  return (
    <View
      className={cn('flex-1 bg-bg', className)}
      style={[
        {
          paddingTop: edgeSet.has('top') ? insets.top : undefined,
          paddingRight: edgeSet.has('right') ? insets.right : undefined,
          paddingBottom: edgeSet.has('bottom') ? insets.bottom : undefined,
          paddingLeft: edgeSet.has('left') ? insets.left : undefined,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
