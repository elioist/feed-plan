import { useMemo, useState, type ComponentType } from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Cloud,
  History,
  Moon,
  Soup,
  Sun,
  UsersRound,
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn, formatDateTime, type MealType, type MenuDetail } from '@feed-plan/shared';
import { SafeScreen } from '~/components/safe-screen';
import { getBottomSafeArea } from '~/constants/layout';
import { api } from '~/lib/api-client';
import { Skeleton, SkeletonCard, SkeletonText } from '~/components/ui/skeleton';

type MealTypeIcon = ComponentType<{ size?: number; color?: string }>;
type MealFilter = 'all' | MealType;

const MEAL_TYPE_CONFIG: Record<MealType, { label: string; bg: string; fg: string; Icon: MealTypeIcon }> = {
  breakfast: { label: '早餐', bg: '#fdf0dc', fg: '#8b6a2a', Icon: Sun },
  lunch: { label: '午餐', bg: '#fae8df', fg: '#c45a32', Icon: Cloud },
  dinner: { label: '晚餐', bg: '#f0e8f5', fg: '#8b5fa8', Icon: Moon },
};

const FILTERS: { value: MealFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'breakfast', label: '早餐' },
  { value: 'lunch', label: '午餐' },
  { value: 'dinner', label: '晚餐' },
];

const getMealQuantity = (meal: MenuDetail) =>
  meal.items.reduce((sum, item) => sum + item.totalQuantity, 0);

const getParticipantsCount = (meal: MenuDetail) => {
  const participants = new Set(
    meal.items.flatMap((dish) =>
      dish.quantities.map((quantity) =>
        quantity.userId ?? quantity.guestName ?? quantity.username ?? 'unknown',
      ),
    ),
  );

  return participants.size;
};

const HistoryCardSkeleton = ({ id }: { id: string }) => (
  <SkeletonCard className="mb-3 rounded-[20px] p-4">
    <View className="flex-row items-start gap-3">
      <Skeleton className="size-11 rounded-2xl bg-chef-soft/70" />
      <View className="flex-1">
        <View className="flex-row gap-2">
          <Skeleton className="h-6 w-14 rounded-full bg-morning-soft/80" />
          <Skeleton className="h-6 w-28 rounded-full bg-bg" />
        </View>
        <SkeletonText className="mt-3" lines={1} widths={['w-2/3']} />
      </View>
      <Skeleton className="size-9 rounded-full bg-bg" />
    </View>
    <View className="mt-4 flex-row gap-2">
      {['dish', 'quantity', 'people'].map((item) => (
        <Skeleton key={`${id}-${item}`} className="h-[58px] flex-1 rounded bg-bg" />
      ))}
    </View>
    <View className="mt-3 flex-row gap-1.5">
      <Skeleton className="h-6 w-16 rounded-full bg-chef-soft/70" />
      <Skeleton className="h-6 w-20 rounded-full bg-chef-soft/70" />
      <Skeleton className="h-6 w-14 rounded-full bg-bg" />
    </View>
  </SkeletonCard>
);

export default function MealHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<MealFilter>('all');

  const { data: meals = [], isLoading } = useQuery<MenuDetail[]>({
    queryKey: ['meals', 'history'],
    queryFn: () => api.meals.list({ status: 'completed' }),
  });

  const sortedMeals = useMemo(
    () => [...meals].sort(
      (a, b) => new Date(b.meal.completedAt ?? b.meal.createdAt).getTime()
        - new Date(a.meal.completedAt ?? a.meal.createdAt).getTime(),
    ),
    [meals],
  );

  const filteredMeals = useMemo(
    () => activeFilter === 'all'
      ? sortedMeals
      : sortedMeals.filter((item) => item.meal.mealType === activeFilter),
    [activeFilter, sortedMeals],
  );

  const totalQuantity = sortedMeals.reduce((sum, meal) => sum + getMealQuantity(meal), 0);
  const topDish = useMemo(() => {
    const counts = new Map<string, { name: string; quantity: number }>();

    sortedMeals.forEach((meal) => {
      meal.items.forEach((item) => {
        const current = counts.get(item.dish.id);
        counts.set(item.dish.id, {
          name: item.dish.name,
          quantity: (current?.quantity ?? 0) + item.totalQuantity,
        });
      });
    });

    return [...counts.values()].sort((a, b) => b.quantity - a.quantity)[0] ?? null;
  }, [sortedMeals]);

  const renderMeal = ({ item }: { item: MenuDetail }) => {
    const meal = item.meal;
    const mealConfig = MEAL_TYPE_CONFIG[meal.mealType] ?? MEAL_TYPE_CONFIG.lunch;
    const quantity = getMealQuantity(item);
    const participants = getParticipantsCount(item);
    const dishPreview = item.items.slice(0, 4).map((dish) => dish.dish.name);

    return (
      <TouchableOpacity
        className="mb-3 rounded-[20px] border border-border bg-surface p-4"
        onPress={() => {
          router.push({
            pathname: '/meals/[id]',
            params: { id: meal.id, returnTo: '/meals/history' },
          });
        }}
        activeOpacity={0.78}
      >
        <View className="flex-row items-start gap-3">
          <View className="size-11 items-center justify-center rounded-2xl" style={{ backgroundColor: mealConfig.bg }}>
            <mealConfig.Icon size={22} color={mealConfig.fg} />
          </View>
          <View className="min-w-0 flex-1">
            <View className="flex-row flex-wrap items-center gap-2">
              <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: mealConfig.bg }}>
                <Text className="text-xs font-bold" style={{ color: mealConfig.fg }}>
                  {mealConfig.label}
                </Text>
              </View>
              <View className="flex-row items-center gap-1 rounded-full bg-bg px-2.5 py-1">
                <Clock3 size={12} color="#8a7565" />
                <Text className="text-[11px] font-semibold text-muted">
                  {formatDateTime(meal.completedAt ?? meal.createdAt) ?? '-'}
                </Text>
              </View>
            </View>
            <Text className="mt-3 font-display text-lg font-extrabold text-fg" numberOfLines={1}>
              {meal.title || `${mealConfig.label}回顾`}
            </Text>
          </View>
          <View className="size-9 items-center justify-center rounded-full bg-bg">
            <ChevronRight size={18} color="#8a7565" />
          </View>
        </View>

        <View className="mt-4 flex-row gap-2">
          <View className="flex-1 rounded bg-bg px-3 py-2.5">
            <Text className="text-[11px] font-semibold text-muted">菜品</Text>
            <Text className="mt-0.5 font-display text-lg font-extrabold text-fg">{item.items.length}</Text>
          </View>
          <View className="flex-1 rounded bg-bg px-3 py-2.5">
            <Text className="text-[11px] font-semibold text-muted">份数</Text>
            <Text className="mt-0.5 font-display text-lg font-extrabold text-fg">{quantity}</Text>
          </View>
          <View className="flex-1 rounded bg-bg px-3 py-2.5">
            <Text className="text-[11px] font-semibold text-muted">食客</Text>
            <Text className="mt-0.5 font-display text-lg font-extrabold text-fg">{participants}</Text>
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
            <Text className="text-xs text-faint">这一单没有留下菜品记录</Text>
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
      <View className="flex-row items-center bg-bg px-4 pb-3 pt-2">
        <TouchableOpacity
          className="size-[38px] items-center justify-center rounded-full border border-border bg-surface"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
              return;
            }

            router.replace('/(tabs)/orders');
          }}
        >
          <ChevronLeft size={24} color="#2d1f14" />
        </TouchableOpacity>
        <View className="ml-3 flex-1">
          <Text className="font-display text-xl font-extrabold text-fg">历史回顾</Text>
          <Text className="mt-0.5 text-xs text-muted">翻一翻之前点过的每一单</Text>
        </View>
      </View>

      <FlatList
        data={filteredMeals}
        keyExtractor={(item) => item.meal.id}
        renderItem={renderMeal}
        contentContainerClassName="px-[18px]"
        contentContainerStyle={{ paddingBottom: getBottomSafeArea(insets.bottom) + 28 }}
        automaticallyAdjustContentInsets={false}
        automaticallyAdjustsScrollIndicatorInsets={false}
        scrollIndicatorInsets={{ bottom: getBottomSafeArea(insets.bottom) }}
        ListHeaderComponent={
          <View className="pb-4 pt-2">
            <View
              className="rounded-[24px] bg-fg p-5"
              style={{
                shadowColor: '#2d1f14',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.16,
                shadowRadius: 24,
                elevation: 7,
              }}
            >
              <View className="flex-row items-center gap-2">
                <View className="size-10 items-center justify-center rounded-full bg-white/12">
                  <History size={20} color="#ffffff" />
                </View>
                <View className="flex-1">
                  {isLoading && sortedMeals.length === 0 ? (
                    <View>
                      <Skeleton className="h-5 w-32 rounded-full bg-white/15" />
                      <Skeleton className="mt-2 h-3 w-40 rounded-full bg-white/10" />
                    </View>
                  ) : (
                    <>
                      <Text className="font-display text-lg font-extrabold text-white">吃过的都在这儿</Text>
                      <Text className="mt-px text-xs text-white/70">
                        {`${sortedMeals.length} 单，${totalQuantity} 份好吃的`}
                      </Text>
                    </>
                  )}
                </View>
              </View>

              <View className="mt-5 flex-row gap-2">
                <View className="flex-1 rounded-[16px] bg-white/10 px-3 py-3">
                  <CalendarDays size={17} color="rgba(255,255,255,0.76)" />
                  {isLoading && sortedMeals.length === 0 ? (
                    <Skeleton className="mt-2 h-8 w-8 rounded-full bg-white/15" />
                  ) : (
                    <Text className="mt-2 font-display text-2xl font-extrabold text-white">{sortedMeals.length}</Text>
                  )}
                  <Text className="text-[11px] font-semibold text-white/65">完成单数</Text>
                </View>
                <View className="flex-1 rounded-[16px] bg-white/10 px-3 py-3">
                  <Soup size={17} color="rgba(255,255,255,0.76)" />
                  {isLoading && sortedMeals.length === 0 ? (
                    <Skeleton className="mt-2 h-8 w-10 rounded-full bg-white/15" />
                  ) : (
                    <Text className="mt-2 font-display text-2xl font-extrabold text-white">{totalQuantity}</Text>
                  )}
                  <Text className="text-[11px] font-semibold text-white/65">累计份数</Text>
                </View>
                <View className="flex-1 rounded-[16px] bg-white/10 px-3 py-3">
                  <UsersRound size={17} color="rgba(255,255,255,0.76)" />
                  {isLoading && sortedMeals.length === 0 ? (
                    <Skeleton className="mt-2 h-5 w-16 rounded-full bg-white/15" />
                  ) : (
                    <Text className="mt-2 font-display text-base font-extrabold text-white" numberOfLines={1}>
                      {topDish?.name ?? '-'}
                    </Text>
                  )}
                  <Text className="text-[11px] font-semibold text-white/65">常点菜</Text>
                </View>
              </View>
            </View>

            <View className="mt-4 flex-row gap-2">
              {FILTERS.map((filter) => {
                const isActive = activeFilter === filter.value;

                return (
                  <TouchableOpacity
                    key={filter.value}
                    onPress={() => setActiveFilter(filter.value)}
                    className={cn(
                      'flex-1 items-center rounded-full border px-3 py-2.5',
                      isActive ? 'border-fg bg-fg' : 'border-border bg-surface',
                    )}
                    activeOpacity={0.78}
                  >
                    <Text className={cn(
                      'font-display text-xs font-bold',
                      isActive ? 'text-white' : 'text-muted',
                    )}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View>
              {['history-skeleton-1', 'history-skeleton-2', 'history-skeleton-3'].map((id) => (
                <HistoryCardSkeleton key={id} id={id} />
              ))}
            </View>
          ) : (
            <View className="items-center justify-center rounded-[20px] border border-dashed border-border bg-surface px-5 py-16">
              <AlertCircle size={48} color="#e8ddd0" />
              <Text className="mt-3 font-display text-base font-bold text-muted">
                还没有历史单
              </Text>
              <Text className="mt-1 text-center text-xs leading-5 text-faint">
                完成一单之后，这里就会留下好吃的回忆
              </Text>
            </View>
          )
        }
      />
    </SafeScreen>
  );
}
