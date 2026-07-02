import { useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Text } from 'react-native';
import { Utensils, Plus, Bell, Minus, Clock3, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeScreen } from '~/components/safe-screen';
import { getTabBarHeight } from '~/constants/layout';
import { api, getImageUrl } from '~/lib/api-client';
import { useCartStore } from '~/stores/cart-store';
import { useAuthStore } from '~/stores/auth-store';
import { formatDateTime, type DishSummary, type MenuDetail } from '@feed-plan/shared';
import { FloatingCart } from '~/components/floating-cart';
import { Skeleton, SkeletonCard, SkeletonText } from '~/components/ui/skeleton';

const DIFFICULTY_CONFIG: Record<string, { label: string; bg: string; fg: string }> = {
  easy: { label: '简单', bg: '#e8f5eb', fg: '#5a9a6a' },
  medium: { label: '中等', bg: '#fdf0dc', fg: '#8b6a2a' },
  hard: { label: '困难', bg: '#fae8df', fg: '#c45a32' },
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.totalItems);
  const total = totalItems();
  const role = user?.roles[0]
    ? {
        label: user.roles[0].name,
        shortLabel: user.roles[0].name.slice(0, 1),
        color: '#c45a32',
        backgroundColor: '#fae8df',
      }
    : null;

  const { data: dishes = [], isLoading: isDishesLoading } = useQuery<DishSummary[]>({
    queryKey: ['dishes'],
    queryFn: () => api.dishes.list({ isActive: true }),
  });

  const { data: todayMeals = [], isLoading: isTodayMealsLoading } = useQuery<MenuDetail[]>({
    queryKey: ['meals', 'today'],
    queryFn: () => api.meals.listToday(),
  });

  const sortedTodayMeals = useMemo(
    () => [...todayMeals].sort(
      (a, b) => new Date(b.meal.createdAt).getTime() - new Date(a.meal.createdAt).getTime(),
    ),
    [todayMeals],
  );
  const currentMeal = sortedTodayMeals.find((item) => item.meal.status === 'ordering') ?? null;
  const completedMeal = sortedTodayMeals.find((item) => item.meal.status === 'completed') ?? null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了';
    if (hour < 11) return '早上好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const getDateStr = () => {
    const now = new Date();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${now.getMonth() + 1} 月 ${now.getDate()} 日 · ${weekdays[now.getDay()]}`;
  };

  const getItemQuantity = (dishId: string) => items.find((item) => item.dishId === dishId)?.quantity ?? 0;

  const handleAddDish = (item: DishSummary) => {
    addItem({ dishId: item.id, name: item.name, coverImage: item.coverImage });
  };

  const renderDishCard = (item: DishSummary) => {
    const quantity = getItemQuantity(item.id);
    const difficulty = DIFFICULTY_CONFIG[item.difficulty] ?? DIFFICULTY_CONFIG.medium;

    return (
      <TouchableOpacity
        key={item.id}
        className="mb-2.5 flex-row items-center rounded border border-border bg-surface p-[11px]"
        onPress={() => router.push(`/dishes/${item.id}`)}
        activeOpacity={0.7}
      >
        <View className="size-[58px] items-center justify-center overflow-hidden rounded-[14px] bg-chef-soft">
          {getImageUrl(item.coverImage) ? (
            <Image source={{ uri: getImageUrl(item.coverImage)! }} className="size-[58px]" resizeMode="cover" />
          ) : (
            <Utensils size={28} color="#c45a32" />
          )}
        </View>

        <View className="ml-3 flex-1">
          <Text className="font-display text-[15px] font-bold text-fg" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="mt-0.5 text-xs text-muted" numberOfLines={1}>
            {item.description}
          </Text>
          <View className="mt-1.5 flex-row items-center gap-2">
            {item.difficulty && (
              <View className="rounded-full px-[7px] py-0.5" style={{ backgroundColor: difficulty.bg }}>
                <Text className="text-[11px] font-semibold" style={{ color: difficulty.fg }}>
                  {difficulty.label}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="ml-1 flex-row items-center gap-1">
          {quantity > 0 ? (
            <>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation?.();
                  updateQuantity(item.id, quantity - 1);
                }}
                className="size-7 items-center justify-center rounded-full border border-border bg-surface"
              >
                <Minus size={14} color="#2d1f14" />
              </TouchableOpacity>
              <Text className="min-w-5 text-center font-display text-sm font-extrabold text-fg">
                {quantity}
              </Text>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation?.();
                  handleAddDish(item);
                }}
                className="size-7 items-center justify-center rounded-full bg-accent"
              >
                <Plus size={14} color="#ffffff" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                handleAddDish(item);
              }}
              className="size-[34px] items-center justify-center rounded-full bg-accent"
            >
              <Plus size={20} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderDishSkeleton = (key: string) => (
    <SkeletonCard key={key} className="mb-2.5 flex-row items-center rounded border p-[11px]">
      <Skeleton className="size-[58px] rounded-[14px] bg-chef-soft/70" />
      <View className="ml-3 flex-1">
        <SkeletonText lines={2} widths={['w-2/3', 'w-full']} />
        <Skeleton className="mt-2 h-5 w-14 rounded-full bg-morning-soft/80" />
      </View>
      <Skeleton className="ml-2 size-[34px] rounded-full bg-chef-soft/80" />
    </SkeletonCard>
  );

  const renderMealCard = () => {
    if (isTodayMealsLoading) {
      return (
        <View
          className="mb-5 rounded-xl bg-accent p-[18px]"
          style={{
            shadowColor: '#c45a32', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 6,
          }}
        >
          <Text className="font-display text-xs font-bold tracking-[0.5px] text-white/80">
            正在确认今日点单
          </Text>
          <Text className="mt-1.5 font-display text-[21px] font-extrabold text-white">
            厨房先看一眼小本本
          </Text>
          <Text className="mt-1 text-[13px] leading-5 text-white/85">
            如果已经开单，会马上带你回到当前这一单。
          </Text>
        </View>
      );
    }

    if (currentMeal) {
      const dishCount = currentMeal.items.length;
      const quantity = currentMeal.items.reduce((sum, item) => sum + item.totalQuantity, 0);

      return (
        <View
          className="mb-5 rounded-xl bg-accent p-[18px]"
          style={{
            shadowColor: '#c45a32', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 8,
          }}
        >
          <View className="flex-row items-center gap-2">
            <View className="rounded-full bg-white/15 px-2.5 py-1">
              <Text className="font-display text-xs font-bold text-white">进行中</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Clock3 size={13} color="rgba(255,255,255,0.8)" />
              <Text className="text-xs font-semibold text-white/80">
                {formatDateTime(currentMeal.meal.createdAt) ?? '刚刚开单'}
              </Text>
            </View>
          </View>
          <Text className="mt-3 font-display text-[21px] font-extrabold text-white" numberOfLines={1}>
            今天这一单正在进行
          </Text>
          <Text className="mt-1 text-[13px] leading-5 text-white/90">
            已点 {dishCount} 道菜，共 {quantity} 份{'\n'}想加菜的话，现在还来得及。
          </Text>
          <View className="mt-[15px] flex-row gap-2">
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/orders')}
              className="flex-row items-center gap-2 rounded-[14px] bg-white px-4 py-3"
              activeOpacity={0.85}
            >
              <Text className="font-display text-[15px] font-extrabold text-accent-ink">
                查看当前单
              </Text>
              <ChevronRight size={17} color="#8b3a1e" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/meals')}
              className="flex-row items-center gap-1.5 rounded-[14px] bg-white/15 px-4 py-3"
              activeOpacity={0.85}
            >
              <Plus size={17} color="#ffffff" />
              <Text className="font-display text-[15px] font-extrabold text-white">
                继续加菜
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (completedMeal) {
      const dishCount = completedMeal.items.length;
      const quantity = completedMeal.items.reduce((sum, item) => sum + item.totalQuantity, 0);

      return (
        <View
          className="mb-5 rounded-xl bg-fg p-[18px]"
          style={{
            shadowColor: '#2d1f14', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.16, shadowRadius: 24, elevation: 7,
          }}
        >
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-1 rounded-full bg-white/12 px-2.5 py-1">
              <CheckCircle2 size={13} color="#ffffff" />
              <Text className="font-display text-xs font-bold text-white">已完成</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Clock3 size={13} color="rgba(255,255,255,0.72)" />
              <Text className="text-xs font-semibold text-white/75">
                {formatDateTime(completedMeal.meal.completedAt ?? completedMeal.meal.createdAt) ?? '今天'}
              </Text>
            </View>
          </View>
          <Text className="mt-3 font-display text-[21px] font-extrabold text-white" numberOfLines={1}>
            今天已经完成过一单
          </Text>
          <Text className="mt-1 text-[13px] leading-5 text-white/85">
            上一单 {dishCount} 道菜，共 {quantity} 份{'\n'}想再开一桌，也可以继续挑菜。
          </Text>
          <View className="mt-[15px] flex-row gap-2">
            <TouchableOpacity
              onPress={() => router.push(`/meals/${completedMeal.meal.id}`)}
              className="flex-row items-center gap-2 rounded-[14px] bg-white px-4 py-3"
              activeOpacity={0.85}
            >
              <Text className="font-display text-[15px] font-extrabold text-accent-ink">
                看看这一单
              </Text>
              <ChevronRight size={17} color="#8b3a1e" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/meals')}
              className="flex-row items-center gap-1.5 rounded-[14px] bg-white/12 px-4 py-3"
              activeOpacity={0.85}
            >
              <Plus size={17} color="#ffffff" />
              <Text className="font-display text-[15px] font-extrabold text-white">
                再挑几道
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View
        className="mb-5 rounded-xl bg-accent p-[18px]"
        style={{
          shadowColor: '#c45a32', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 8,
        }}
      >
        <Text className="font-display text-xs font-bold tracking-[0.5px] text-white/85">
          今日尚未开单
        </Text>
        <Text className="mt-1.5 font-display text-[21px] font-extrabold text-white">
          开启今天的点单
        </Text>
        <Text className="mt-1 text-[13px] leading-5 text-white/90">
          开单后，你和食客都能随时加菜{'\n'}直到你这位主厨喊停。
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/cart')}
          className="mt-[15px] flex-row items-center gap-2 self-start rounded-[14px] bg-white px-5 py-3"
          style={{
            shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 4,
          }}
          activeOpacity={0.85}
        >
          <Plus size={18} color="#8b3a1e" />
          <Text className="font-display text-[15px] font-extrabold text-accent-ink">
            我来开单
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        automaticallyAdjustContentInsets={false}
        automaticallyAdjustsScrollIndicatorInsets={false}
        contentContainerStyle={{ paddingBottom: getTabBarHeight(insets.bottom) + (total > 0 ? 110 : 20) }}
        scrollIndicatorInsets={{ bottom: getTabBarHeight(insets.bottom) + (total > 0 ? 90 : 0) }}
      >
        {/* Greeting */}
        <View className="flex-row items-start gap-3 px-[18px] pb-2 pt-3">
          <View className="flex-1">
            <Text className="font-display text-2xl font-extrabold text-fg">
              {getGreeting()}，{user?.username ?? '食客'}
            </Text>
            <Text className="mt-0.5 text-[13px] text-muted">
              {getDateStr()} · 今天想吃点什么
            </Text>
          </View>
          <TouchableOpacity className="size-[38px] items-center justify-center rounded-full border border-border bg-surface">
            <Bell size={19} color="#2d1f14" />
          </TouchableOpacity>
        </View>

        {/* Role Badge */}
        {role && (
          <View className="px-[18px] pb-1">
            <View className="flex-row items-center gap-[7px] self-start rounded-full px-3 py-[5px]" style={{ backgroundColor: role.backgroundColor }}>
              <View className="size-[22px] items-center justify-center rounded-full" style={{ backgroundColor: role.color }}>
                <Text className="text-[11px] font-bold text-white">
                  {role.shortLabel}
                </Text>
              </View>
              <Text className="text-[13px] font-bold" style={{ color: role.color }}>
                {role.label} · 随时点菜
              </Text>
            </View>
          </View>
        )}

        <View className="px-[18px] pt-2">
          {renderMealCard()}

          {/* Breakfast Section */}
          {(dishes.length > 0 || isDishesLoading) && (
            <>
              <View className="mb-3 flex-row items-center gap-2">
                <View className="rounded-full bg-morning-soft px-2 py-[3px]">
                  <Text className="text-xs font-bold text-[#8b6a2a]">早</Text>
                </View>
                <Text className="font-display text-base font-extrabold text-fg">今日推荐</Text>
                <View className="flex-1" />
                <TouchableOpacity onPress={() => router.push('/(tabs)/meals')}>
                  <Text className="text-xs font-semibold text-muted">全部 ›</Text>
                </TouchableOpacity>
              </View>
              {isDishesLoading && dishes.length === 0
                ? ['home-dish-1', 'home-dish-2', 'home-dish-3', 'home-dish-4'].map(renderDishSkeleton)
                : dishes.slice(0, 4).map((dish) => renderDishCard(dish))}
            </>
          )}
        </View>
      </ScrollView>
      <FloatingCart />
    </SafeScreen>
  );
}
