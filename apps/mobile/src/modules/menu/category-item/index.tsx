import { memo } from 'react';
import { TouchableOpacity, type LayoutChangeEvent } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

type CategoryItemProps = {
  count: number;
  isActive: boolean;
  name: string;
  onLayout: (event: LayoutChangeEvent) => void;
  onPress: () => void;
};

const MOTION_CONFIG = {
  duration: 180,
} as const;

const INDICATOR_HEIGHT = 34;

type CategoryActiveIndicatorProps = {
  layout: { height: number; y: number } | null;
};

export function CategoryActiveIndicator({ layout }: CategoryActiveIndicatorProps) {
  const top = useDerivedValue(() =>
    withTiming(
      layout ? layout.y + Math.max((layout.height - INDICATOR_HEIGHT) / 2, 0) : 0,
      MOTION_CONFIG,
    )
  );

  const opacity = useDerivedValue(() =>
    withTiming(layout ? 1 : 0, MOTION_CONFIG)
  );

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: top.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      className="absolute left-0 top-0 z-10 h-[34px] w-1 rounded-full bg-accent"
      style={indicatorStyle}
    />
  );
}

function CategoryItemComponent({ count, isActive, name, onLayout, onPress }: CategoryItemProps) {
  const progress = useDerivedValue(() =>
    withTiming(isActive ? 1 : 0, MOTION_CONFIG)
  );

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [0, 2]),
      },
    ],
  }));

  const nameStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], ['#8a7565', '#8f3f24']),
  }));

  const countStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], ['#c7b7a8', '#c45a32']),
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [0, 2]),
      },
    ],
  }));

  const countDotStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.36, 1]),
    transform: [
      {
        scale: interpolate(progress.value, [0, 1], [0.72, 1]),
      },
    ],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className="px-1 py-1"
      onLayout={onLayout}
      onPress={onPress}
    >
      <Animated.View
        className="relative px-2.5 py-2.5 pl-3"
        style={containerStyle}
      >
        <Animated.Text
          className="font-display text-[13px] font-bold"
          numberOfLines={1}
          style={nameStyle}
        >
          {name}
        </Animated.Text>
        <Animated.View className="mt-1 flex-row items-center gap-1.5">
          <Animated.View
            className="size-1.5 rounded-full bg-accent"
            style={countDotStyle}
          />
          <Animated.Text
            className="text-[10px] font-semibold"
            style={countStyle}
          >
            {count} 道
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export const CategoryItem = memo(CategoryItemComponent);
