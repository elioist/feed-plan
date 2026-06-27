import { View, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeScreen } from '~/components/safe-screen';
import { useCartStore } from '~/stores/cart-store';
import { api, getImageUrl } from '~/lib/api-client';
import type { MealType } from '@feed-plan/shared';
import { getOrderErrorFeedback } from '~/lib/order-errors';
import { useAuthStore } from '~/stores/auth-store';

const MEAL_OPTIONS: { value: MealType; label: string; icon: string }[] = [
  { value: 'breakfast', label: '早餐', icon: 'weather-sunny' },
  { value: 'lunch', label: '午餐', icon: 'white-balance-sunny' },
  { value: 'dinner', label: '晚餐', icon: 'weather-night' },
];

export default function CartScreen() {
  const router = useRouter();
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
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 18, paddingBottom: 200 }}
      >
        {/* Meal Type */}
        <Text
          style={{
            fontSize: 17,
            fontWeight: '800',
            color: '#2d1f14',
            fontFamily: '"Baloo 2"',
            marginBottom: 12,
          }}
        >
          这一单是
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
          {MEAL_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setMealType(option.value)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: mealType === option.value ? '#2d1f14' : '#e8ddd0',
                backgroundColor: mealType === option.value ? '#2d1f14' : '#fffcf8',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <MaterialCommunityIcons
                name={option.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={16}
                color={mealType === option.value ? '#ffffff' : '#8a7565'}
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  fontFamily: '"Baloo 2"',
                  color: mealType === option.value ? '#ffffff' : '#8a7565',
                }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cart Items */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: '800',
              color: '#2d1f14',
              fontFamily: '"Baloo 2"',
            }}
          >
            购物车
          </Text>
          <Text style={{ fontSize: 13, color: '#8a7565' }}>
            {totalItems()} 件
          </Text>
        </View>

        <View
          style={{
            backgroundColor: '#fffcf8',
            borderWidth: 1,
            borderColor: '#e8ddd0',
            borderRadius: 22,
            padding: 16,
          }}
        >
          {items.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <MaterialCommunityIcons name="cart-outline" size={40} color="#e8ddd0" />
              <Text style={{ color: '#b8a898', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
                购物车还是空的{'\n'}去菜单挑几道想吃的吧
              </Text>
            </View>
          ) : (
            items.map((item, index) => (
              <View
                key={item.dishId}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 12,
                  borderBottomWidth: index < items.length - 1 ? 1 : 0,
                  borderBottomColor: '#e8ddd0',
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: '#fae8df',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {getImageUrl(item.coverImage) ? (
                    <Image
                      source={{ uri: getImageUrl(item.coverImage)! }}
                      style={{ width: 48, height: 48 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <MaterialCommunityIcons name="food" size={24} color="#c45a32" />
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: '#2d1f14',
                      fontFamily: '"Baloo 2"',
                    }}
                  >
                    {item.name}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <TouchableOpacity
                    onPress={() => updateQuantity(item.dishId, item.quantity - 1)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: '#e8ddd0',
                      backgroundColor: '#fffcf8',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialCommunityIcons name="minus" size={14} color="#2d1f14" />
                  </TouchableOpacity>
                  <Text
                    style={{
                      minWidth: 20,
                      textAlign: 'center',
                      fontSize: 15,
                      fontWeight: '800',
                      fontFamily: '"Baloo 2"',
                      color: '#2d1f14',
                    }}
                  >
                    {item.quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() => updateQuantity(item.dishId, item.quantity + 1)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: '#c45a32',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialCommunityIcons name="plus" size={14} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Note */}
        <Text
          style={{
            fontSize: 17,
            fontWeight: '800',
            color: '#2d1f14',
            fontFamily: '"Baloo 2"',
            marginTop: 24,
            marginBottom: 12,
          }}
        >
          给厨房的备注
        </Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={2}
          placeholder="想吃辣一点 / 米饭少一点..."
          placeholderTextColor="#b8a898"
          mode="outlined"
          outlineStyle={{ borderRadius: 14, borderColor: '#e8ddd0' }}
          style={{ backgroundColor: '#fffcf8' }}
        />
      </ScrollView>

      {/* Checkout Bar */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 80,
          padding: 14,
          paddingBottom: 16,
          backgroundColor: 'rgba(255, 252, 248, 0.95)',
          borderTopWidth: 1,
          borderTopColor: '#e8ddd0',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 13, color: '#8a7565' }}>
            共 <Text style={{ fontWeight: '700', color: '#2d1f14' }}>{totalItems()}</Text> 道菜
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleCheckout}
          disabled={orderMutation.isPending}
          style={{
            backgroundColor: items.length === 0 ? '#d4845a' : '#c45a32',
            paddingVertical: 16,
            borderRadius: 14,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            shadowColor: '#c45a32',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.32,
            shadowRadius: 16,
            elevation: 6,
          }}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="fire" size={20} color="#ffffff" />
          <Text
            style={{
              color: '#ffffff',
              fontSize: 16,
              fontWeight: '700',
              fontFamily: '"Baloo 2"',
            }}
          >
            {orderMutation.isPending ? '开单中...' : '开单并下厨'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}
