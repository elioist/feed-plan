import { TouchableOpacity } from 'react-native';
import { ArrowUp } from 'lucide-react-native';

type BackToTopProps = {
  bottom: number;
  onPress: () => void;
  visible: boolean;
};

export function BackToTop({ bottom, onPress, visible }: BackToTopProps) {
  if (!visible) return null;

  return (
    <TouchableOpacity
      accessibilityLabel="回到顶部"
      activeOpacity={0.82}
      className="absolute right-4 z-20 size-11 items-center justify-center rounded-full border border-border bg-surface shadow-md"
      onPress={onPress}
      style={{
        bottom,
        shadowColor: '#2d1f14',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.14,
        shadowRadius: 14,
        elevation: 6,
      }}
    >
      <ArrowUp size={20} color="#c45a32" strokeWidth={2.4} />
    </TouchableOpacity>
  );
}
