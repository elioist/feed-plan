import { View, Text, StyleSheet } from 'react-native';

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
      <View style={[styles.container, { width: size, height: size, backgroundColor: fallback.bg, borderRadius: size * 0.25 }]}>
        <Text style={[styles.text, { fontSize: size * 0.45, color: '#ffffff' }]}>{fallback.text}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor: '#6b7890', borderRadius: size * 0.25 }]}>
      <Text style={[styles.text, { fontSize: size * 0.45, color: '#ffffff' }]}>{label ?? '?'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
  },
});
