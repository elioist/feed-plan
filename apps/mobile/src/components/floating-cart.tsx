import { View, TouchableOpacity, Text } from 'react-native';
import { ShoppingCart, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FLOATING_CART_TAB_GAP, getTabBarHeight } from '~/constants/layout';
import { useCartStore } from '~/stores/cart-store';

export function FloatingCart() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const total = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  if (total === 0) return null;

  return (
    <TouchableOpacity
      className="absolute left-4 right-4 flex-row items-center gap-3 rounded bg-accent px-4 py-3.5 shadow-lg"
      style={{
        bottom: getTabBarHeight(insets.bottom) + FLOATING_CART_TAB_GAP,
        shadowColor: '#c45a32',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 8,
      }}
      onPress={() => router.push('/(tabs)/cart')}
      activeOpacity={0.85}
    >
      <View className="relative">
        <ShoppingCart size={22} color="#ffffff" />
        <View className="absolute -right-2.5 -top-2 h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1">
          <Text className="font-display text-[10px] font-extrabold text-accent">{total}</Text>
        </View>
      </View>
      <View className="flex-1">
        <Text className="font-display text-sm font-bold text-white">
          {total} 道菜
        </Text>
        <Text className="mt-0.5 text-[11px] text-white/80">去下单</Text>
      </View>
      <ChevronRight size={20} color="#ffffff" />
    </TouchableOpacity>
  );
}
