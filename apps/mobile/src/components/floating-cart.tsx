import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCartStore } from '~/stores/cart-store';

export function FloatingCart() {
  const router = useRouter();
  const { items, totalItems } = useCartStore();
  const total = totalItems();

  if (total === 0) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push('/(tabs)/cart')}
      activeOpacity={0.85}
    >
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons name="cart" size={22} color="#ffffff" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{total}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.totalText}>
          {total} 道菜
        </Text>
        <Text style={styles.hint}>去下单</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#ffffff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 90,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#c45a32',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#c45a32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#c45a32',
    fontFamily: '"Baloo 2"',
  },
  info: {
    flex: 1,
  },
  totalText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: '"Baloo 2"',
  },
  hint: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 1,
  },
});
