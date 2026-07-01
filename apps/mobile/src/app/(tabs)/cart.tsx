import type { ComponentType } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Image, Text, TextInput } from 'react-native';
import { ShoppingCart, Utensils, Minus, Plus, Flame, Sun, Moon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeScreen } from '~/components/safe-screen';
import { getTabBarHeight } from '~/constants/layout';
import { useCartStore } from '~/stores/cart-store';
import { api, getImageUrl } from '~/lib/api-client';
import { cn, type MealType } from '@feed-plan/shared';
import { getOrderErrorFeedback } from '~/lib/order-errors';
import { useAuthStore } from '~/stores/auth-store';

type MealOptionIcon = ComponentType<{ size?: number; color?: string }>;

const MEAL_OPTIONS: { value: MealType; label: string; Icon: MealOptionIcon }[] = [
  { value: 'breakfast', label: '早餐', Icon: Sun },
  { value: 'lunch', label: '午餐', Icon: Utensils },
  { value: 'dinner', label: '晚餐', Icon: Moon },
];

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { items, mealType, note, setMealType, setNote, updateQuantity, totalItems } = useCartStore();
  const logout = useAuthStore((state) => state.logout);

  const orderMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const mealDate = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}-${`${now.getDate()}`.padStart(2, '0')}`;
      const detail = await api.meals.getOrCreateCurrent({
        mealDate,
        mealType,
        type: 'daily',
      });

      for (const item of items) {
        await api.meals.addOrder(detail.meal.id, {
          dishId: item.dishId,
          quantity: item.quantity,
          note: note || undefined,
        });
      }

      return detail.meal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      useCartStore.getState().clearCart();
      Alert.alert('成功', '已开单！', [{ text: '确定', onPress: () => router.navigate('/(tabs)/meals') }]);
    },
    onError: (error) => {
      const feedback = getOrderErrorFeedback(error);
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      Alert.alert(feedback.title, feedback.message, [
        {
          text: '确定',
          onPress: () => {
            if (feedback.shouldLogin) {
              void logout().then(() => router.replace('/login'));
            }
          },
        },
      ]);
    },
  });

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('提示', '购物车还是空的，去菜单挑几道想吃的吧');
      return;
    }
    orderMutation.mutate();
  };

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-[18px]"
        automaticallyAdjustContentInsets={false}
        automaticallyAdjustsScrollIndicatorInsets={false}
        contentContainerStyle={{ paddingBottom: getTabBarHeight(insets.bottom) + 150 }}
        scrollIndicatorInsets={{ bottom: getTabBarHeight(insets.bottom) + 120 }}
      >
        {/* Meal Type */}
        <Text className="mb-3 font-display text-[17px] font-extrabold text-fg">
          这一单是
        </Text>
        <View className="mb-6 flex-row gap-2">
          {MEAL_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setMealType(option.value)}
              className={cn(
                'flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border-[1.5px] py-2.5',
                mealType === option.value
                  ? 'border-fg bg-fg'
                  : 'border-border bg-surface',
              )}
            >
              <option.Icon
                size={16}
                color={mealType === option.value ? '#ffffff' : '#8a7565'}
              />
              <Text className={cn('font-display text-sm font-bold', mealType === option.value ? 'text-white' : 'text-muted')}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cart Items */}
        <View className="mb-3 flex-row items-baseline justify-between">
          <Text className="font-display text-[17px] font-extrabold text-fg">
            购物车
          </Text>
          <Text className="text-[13px] text-muted">
            {totalItems()} 件
          </Text>
        </View>

        <View className="rounded-lg border border-border bg-surface p-4">
          {items.length === 0 ? (
            <View className="items-center py-6">
              <ShoppingCart size={40} color="#e8ddd0" />
              <Text className="mt-2 text-center text-[13px] text-faint">
                购物车还是空的{'\n'}去菜单挑几道想吃的吧
              </Text>
            </View>
          ) : (
            items.map((item, index) => (
              <View
                key={item.dishId}
                className={cn(
                  'flex-row items-center gap-3 py-3',
                  index < items.length - 1 && 'border-b border-border',
                )}
              >
                <View className="size-12 items-center justify-center overflow-hidden rounded-xl bg-chef-soft">
                  {getImageUrl(item.coverImage) ? (
                    <Image
                      source={{ uri: getImageUrl(item.coverImage)! }}
                      className="size-12"
                      resizeMode="cover"
                    />
                  ) : (
                    <Utensils size={24} color="#c45a32" />
                  )}
                </View>

                <View className="flex-1">
                  <Text className="font-display text-[15px] font-bold text-fg">
                    {item.name}
                  </Text>
                </View>

                <View className="flex-row items-center gap-1">
                  <TouchableOpacity
                    onPress={() => updateQuantity(item.dishId, item.quantity - 1)}
                    className="size-7 items-center justify-center rounded-full border border-border bg-surface"
                  >
                    <Minus size={14} color="#2d1f14" />
                  </TouchableOpacity>
                  <Text className="min-w-5 text-center font-display text-[15px] font-extrabold text-fg">
                    {item.quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() => updateQuantity(item.dishId, item.quantity + 1)}
                    className="size-7 items-center justify-center rounded-full bg-accent"
                  >
                    <Plus size={14} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Note */}
        <Text className="mb-3 mt-6 font-display text-[17px] font-extrabold text-fg">
          给厨房的备注
        </Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={2}
          placeholder="想吃辣一点 / 米饭少一点..."
          placeholderTextColor="#b8a898"
          className="min-h-[72px] rounded-[14px] border border-border bg-surface px-3 py-2.5 text-sm text-fg"
          textAlignVertical="top"
        />
      </ScrollView>

      {/* Checkout Bar */}
      <View
        className="absolute left-0 right-0 border-t border-border bg-surface/95 p-3.5 pb-4"
        style={{ bottom: getTabBarHeight(insets.bottom) }}
      >
        <View className="mb-3 flex-row items-center">
          <Text className="text-[13px] text-muted">
            共 <Text className="font-bold text-fg">{totalItems()}</Text> 道菜
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleCheckout}
          disabled={orderMutation.isPending}
          className={cn(
            'flex-row items-center justify-center gap-2 rounded-[14px] py-4',
            items.length === 0 ? 'bg-[#d4845a]' : 'bg-accent',
          )}
          style={{
            shadowColor: '#c45a32',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.32,
            shadowRadius: 16,
            elevation: 6,
          }}
          activeOpacity={0.85}
        >
          <Flame size={20} color="#ffffff" />
          <Text className="font-display text-base font-bold text-white">
            {orderMutation.isPending ? '开单中...' : '开单并下厨'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}
