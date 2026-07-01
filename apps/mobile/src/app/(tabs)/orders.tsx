import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import { ChevronRight, FileText } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeScreen } from '~/components/safe-screen';
import { getTabBarHeight } from '~/constants/layout';
import { api } from '~/lib/api-client';
import type { Meal, MealType } from '@feed-plan/shared';

const MEAL_LABELS: Record<MealType, { label: string; color: string; bg: string }> = {
  breakfast: { label: '早餐', color: '#8b6a2a', bg: '#fdf0dc' },
  lunch: { label: '午餐', color: '#8b3a1e', bg: '#fae8df' },
  dinner: { label: '晚餐', color: '#5a3a8a', bg: '#f0e8f5' },
};

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: meals = [], isLoading } = useQuery<Meal[]>({
    queryKey: ['meals'],
    queryFn: async () => {
      const details = await api.meals.list({ status: 'ordering' });
      return details.map((detail) => detail.meal);
    },
  });

  const renderMeal = ({ item }: { item: Meal }) => {
    const mealConfig = MEAL_LABELS[item.mealType] ?? MEAL_LABELS.lunch;

    return (
      <TouchableOpacity
        className="mb-3 rounded border border-border bg-surface p-4"
        onPress={() => router.push(`/meals/${item.id}`)}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5">
            <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: mealConfig.bg }}>
              <Text className="text-xs font-bold" style={{ color: mealConfig.color }}>{mealConfig.label}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="size-2 rounded-full bg-herb" />
              <Text className="text-xs font-semibold text-herb">进行中</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#b8a898" />
        </View>
        <Text className="mt-3 font-display text-base font-bold text-fg">
          {item.title ?? `${mealConfig.label}场次`}
        </Text>
        <Text className="mt-1 text-xs text-muted">
          {item.mealDate}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeScreen>
      <View className="px-[18px] pb-2 pt-4">
        <Text className="font-display text-[22px] font-extrabold text-fg">
          当前单
        </Text>
        <Text className="mt-0.5 text-xs text-muted">
          进行中的点餐场次
        </Text>
      </View>

      <FlatList
        data={meals}
        keyExtractor={(item) => item.id}
        renderItem={renderMeal}
        contentContainerClassName="px-[18px]"
        contentContainerStyle={{ paddingBottom: getTabBarHeight(insets.bottom) + 20 }}
        automaticallyAdjustContentInsets={false}
        automaticallyAdjustsScrollIndicatorInsets={false}
        scrollIndicatorInsets={{ bottom: getTabBarHeight(insets.bottom) }}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <FileText size={48} color="#e8ddd0" />
            <Text className="mt-3 text-sm text-faint">
              {isLoading ? '加载中...' : '暂无进行中的订单'}
            </Text>
            <Text className="mt-1 text-xs text-faint">
              去首页开一单吧
            </Text>
          </View>
        }
      />
    </SafeScreen>
  );
}
