import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import { ChevronRight, Clock3, CookingPot, FileText, Soup, UsersRound } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn, formatDateTime, type MealType, type MenuDetail } from '@feed-plan/shared';
import { SafeScreen } from '~/components/safe-screen';
import { getTabBarHeight } from '~/constants/layout';
import { api } from '~/lib/api-client';

const MEAL_LABELS: Record<MealType, { label: string; badgeClassName: string; textClassName: string }> = {
  breakfast: { label: '早餐', badgeClassName: 'bg-morning-soft', textClassName: 'text-[#8b6a2a]' },
  lunch: { label: '午餐', badgeClassName: 'bg-noon-soft', textClassName: 'text-accent-ink' },
  dinner: { label: '晚餐', badgeClassName: 'bg-night-soft', textClassName: 'text-night' },
};

const SummaryItem = ({ label, value }: { label: string; value: number | string }) => (
  <View className="flex-1 rounded border border-border bg-surface px-3 py-2.5">
    <Text className="text-[11px] font-semibold text-muted">{label}</Text>
    <Text className="mt-0.5 font-display text-xl font-extrabold text-fg">{value}</Text>
  </View>
);

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: meals = [], isLoading } = useQuery<MenuDetail[]>({
    queryKey: ['meals'],
    queryFn: () => api.meals.list({ status: 'ordering' }),
  });

  const totalDishes = meals.reduce((sum, item) => sum + item.items.length, 0);
  const totalQuantity = meals.reduce(
    (sum, item) => sum + item.items.reduce((itemSum, dish) => itemSum + dish.totalQuantity, 0),
    0,
  );

  const renderMeal = ({ item }: { item: MenuDetail }) => {
    const meal = item.meal;
    const mealConfig = MEAL_LABELS[meal.mealType] ?? MEAL_LABELS.lunch;
    const quantity = item.items.reduce((sum, dish) => sum + dish.totalQuantity, 0);
    const participants = new Set(
      item.items.flatMap((dish) =>
        dish.quantities.map((quantityItem) =>
          quantityItem.username ?? quantityItem.guestName ?? '未知食客',
        ),
      ),
    );
    const dishPreview = item.items.slice(0, 3).map((dish) => dish.dish.name);

    return (
      <TouchableOpacity
        className="mb-3 rounded-lg border border-border bg-surface p-4"
        onPress={() => {
          router.push({
            pathname: '/meals/[id]',
            params: { id: meal.id, returnTo: '/(tabs)/orders' },
          });
        }}
        activeOpacity={0.78}
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1">
            <View className="flex-row flex-wrap items-center gap-2">
              <View className={cn('rounded-full px-2.5 py-1', mealConfig.badgeClassName)}>
                <Text className={cn('text-xs font-bold', mealConfig.textClassName)}>
                  {mealConfig.label}
                </Text>
              </View>
              <View className="flex-row items-center gap-1 rounded-full bg-herb-soft px-2.5 py-1">
                <View className="size-1.5 rounded-full bg-herb" />
                <Text className="text-xs font-bold text-herb">接单中</Text>
              </View>
            </View>
            <Text className="mt-3 font-display text-[18px] font-extrabold text-fg" numberOfLines={1}>
              {meal.title ?? `${mealConfig.label}场次`}
            </Text>
            <View className="mt-2 flex-row items-center gap-1.5">
              <Clock3 size={14} color="#8a7565" />
              <Text className="text-xs font-semibold text-muted">
                {formatDateTime(meal.createdAt) ?? '-'}
              </Text>
            </View>
          </View>
          <View className="size-9 items-center justify-center rounded-full bg-bg">
            <ChevronRight size={18} color="#8a7565" />
          </View>
        </View>

        <View className="mt-4 flex-row gap-2">
          <View className="flex-1 flex-row items-center gap-2 rounded bg-bg px-3 py-2.5">
            <Soup size={16} color="#c45a32" />
            <Text className="text-xs font-semibold text-muted">
              <Text className="font-display text-base font-extrabold text-fg">{item.items.length}</Text> 道菜
            </Text>
          </View>
          <View className="flex-1 flex-row items-center gap-2 rounded bg-bg px-3 py-2.5">
            <CookingPot size={16} color="#c45a32" />
            <Text className="text-xs font-semibold text-muted">
              <Text className="font-display text-base font-extrabold text-fg">{quantity}</Text> 份
            </Text>
          </View>
          <View className="flex-1 flex-row items-center gap-2 rounded bg-bg px-3 py-2.5">
            <UsersRound size={16} color="#c45a32" />
            <Text className="text-xs font-semibold text-muted">
              <Text className="font-display text-base font-extrabold text-fg">{participants.size}</Text> 人
            </Text>
          </View>
        </View>

        <View className="mt-3 flex-row flex-wrap gap-1.5">
          {dishPreview.length > 0 ? (
            dishPreview.map((dish) => (
              <View key={dish} className="rounded-full bg-chef-soft px-2.5 py-1">
                <Text className="text-[11px] font-semibold text-accent-ink" numberOfLines={1}>
                  {dish}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-xs text-faint">这一单还空着，等一道想吃的菜登场</Text>
          )}
          {item.items.length > dishPreview.length ? (
            <View className="rounded-full bg-bg px-2.5 py-1">
              <Text className="text-[11px] font-semibold text-muted">
                +{item.items.length - dishPreview.length}
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeScreen>
      <FlatList
        data={meals}
        keyExtractor={(item) => item.meal.id}
        renderItem={renderMeal}
        contentContainerClassName="px-[18px]"
        contentContainerStyle={{ paddingBottom: getTabBarHeight(insets.bottom) + 20 }}
        automaticallyAdjustContentInsets={false}
        automaticallyAdjustsScrollIndicatorInsets={false}
        scrollIndicatorInsets={{ bottom: getTabBarHeight(insets.bottom) }}
        ListHeaderComponent={
          <View className="pb-4 pt-4">
            <View className="mb-4 flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="font-display text-[24px] font-extrabold text-fg">当前单</Text>
                <Text className="mt-0.5 text-xs text-muted">进行中的点餐场次</Text>
              </View>
              <View className="flex-row items-center gap-1.5 rounded-full bg-herb-soft px-3 py-1.5">
                <CookingPot size={15} color="#5a9a6a" />
                <Text className="text-xs font-bold text-herb">{meals.length} 单</Text>
              </View>
            </View>

            <View className="rounded-lg border border-border bg-surface p-4">
              <View className="flex-row items-center gap-2">
                <View className="size-9 items-center justify-center rounded-full bg-chef-soft">
                  <CookingPot size={18} color="#c45a32" />
                </View>
                <View className="flex-1">
                  <Text className="font-display text-base font-extrabold text-fg">厨房小结</Text>
                  <Text className="mt-px text-xs text-muted">点开场次可以查看完整菜单</Text>
                </View>
              </View>
              <View className="mt-4 flex-row gap-2">
                <SummaryItem label="场次" value={meals.length} />
                <SummaryItem label="菜品" value={totalDishes} />
                <SummaryItem label="份数" value={totalQuantity} />
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center justify-center rounded-lg border border-dashed border-border bg-surface px-5 py-16">
            <FileText size={48} color="#e8ddd0" />
            <Text className="mt-3 font-display text-base font-bold text-muted">
              {isLoading ? '加载中...' : '暂时没有进行中的单'}
            </Text>
            <Text className="mt-1 text-xs text-faint">
              先去菜单挑几道，厨房就有活儿了
            </Text>
          </View>
        }
      />
    </SafeScreen>
  );
}
