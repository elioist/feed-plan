import { View, FlatList, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { SafeScreen } from '~/components/safe-screen';
import { getMeals } from '~/lib/api/meals';
import type { Meal, MealType } from '@feed-plan/shared';

const MEAL_LABELS: Record<MealType, { label: string; color: string; bg: string }> = {
  breakfast: { label: '早餐', color: '#8b6a2a', bg: '#fdf0dc' },
  lunch: { label: '午餐', color: '#8b3a1e', bg: '#fae8df' },
  dinner: { label: '晚餐', color: '#5a3a8a', bg: '#f0e8f5' },
};

export default function OrdersScreen() {
  const router = useRouter();

  const { data: meals = [], isLoading } = useQuery<Meal[]>({
    queryKey: ['meals'],
    queryFn: () => getMeals({ status: 'ordering' }),
  });

  const renderMeal = ({ item }: { item: Meal }) => {
    const mealConfig = MEAL_LABELS[item.mealType] ?? MEAL_LABELS.lunch;

    return (
      <TouchableOpacity
        style={{
          backgroundColor: '#fffcf8',
          borderWidth: 1,
          borderColor: '#e8ddd0',
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
        }}
        onPress={() => router.push(`/meals/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ backgroundColor: mealConfig.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: mealConfig.color }}>{mealConfig.label}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#5a9a6a' }} />
              <Text style={{ fontSize: 12, color: '#5a9a6a', fontWeight: '600' }}>进行中</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color="#b8a898" />
        </View>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#2d1f14', marginTop: 12, fontFamily: '"Baloo 2"' }}>
          {item.title ?? `${mealConfig.label}场次`}
        </Text>
        <Text style={{ fontSize: 12, color: '#8a7565', marginTop: 4 }}>
          {item.mealDate}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeScreen>
      <View style={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#2d1f14', fontFamily: '"Baloo 2"' }}>
          当前单
        </Text>
        <Text style={{ fontSize: 12, color: '#8a7565', marginTop: 2 }}>
          进行中的点餐场次
        </Text>
      </View>

      <FlatList
        data={meals}
        keyExtractor={(item) => item.id}
        renderItem={renderMeal}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
            <MaterialCommunityIcons name="receipt-text-outline" size={48} color="#e8ddd0" />
            <Text style={{ color: '#b8a898', fontSize: 14, marginTop: 12 }}>
              {isLoading ? '加载中...' : '暂无进行中的订单'}
            </Text>
            <Text style={{ color: '#b8a898', fontSize: 12, marginTop: 4 }}>
              去首页开一单吧
            </Text>
          </View>
        }
      />
    </SafeScreen>
  );
}
