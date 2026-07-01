import { View, Text } from 'react-native';

interface BrandIconProps {
  icon: string;
  size?: number;
  label?: string;
}

// Fallback icons for common platforms
const FALLBACK_ICONS: Record<string, { text: string; bg: string }> = {
  'logos:tiktok-icon': { text: 'T', bg: '#000000' },
  'logos:bilibili': { text: 'B', bg: '#00a1d6' },
  'logos:xiaohongshu-icon': { text: '小', bg: '#ff2442' },
  'logos:youtube-icon': { text: '▶', bg: '#ff0000' },
};

export function BrandIcon({ icon, size = 24, label }: BrandIconProps) {
  const fallback = FALLBACK_ICONS[icon];

  if (fallback) {
    return (
      <View
        className="items-center justify-center"
        style={{ width: size, height: size, backgroundColor: fallback.bg, borderRadius: size * 0.25 }}
      >
        <Text className="font-bold text-white" style={{ fontSize: size * 0.45 }}>{fallback.text}</Text>
      </View>
    );
  }

  return (
    <View
      className="items-center justify-center bg-[#6b7890]"
      style={{ width: size, height: size, borderRadius: size * 0.25 }}
    >
      <Text className="font-bold text-white" style={{ fontSize: size * 0.45 }}>{label ?? '?'}</Text>
    </View>
  );
}
