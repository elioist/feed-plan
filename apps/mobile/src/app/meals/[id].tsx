import type { ComponentType } from 'react';
import { View, ScrollView, Alert, TouchableOpacity, Image, Text } from 'react-native';
import { Loader, AlertCircle, ChevronLeft, Utensils, Plus, Lock, CheckCircle, Sun, Cloud, Moon } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, getImageUrl } from '~/lib/api-client';
import { useAuthStore } from '~/stores/auth-store';
import { SafeScreen } from '~/components/safe-screen';
import { getBottomSafeArea } from '~/constants/layout';
import type { MenuDetail } from '@feed-plan/shared';

type MealTypeIcon = ComponentType<{ size?: number; color?: string }>;

const MEAL_TYPE_CONFIG: Record<string, { label: string; bg: string; fg: string; Icon: MealTypeIcon }> = {
  breakfast: { label: '早餐', bg: '#fdf0dc', fg: '#8b6a2a', Icon: Sun },
  lunch: { label: '午餐', bg: '#fae8df', fg: '#c45a32', Icon: Cloud },
  dinner: { label: '晚餐', bg: '#f0e8f5', fg: '#8b5fa8', Icon: Moon },
};

export default function MealDetailScreen() {
  const { id, returnTo } = useLocalSearchParams<{ id: string; returnTo?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery<MenuDetail>({
    queryKey: ['meal', id],
    queryFn: () => api.meals.get(id!),
    enabled: !!id,
  });

  const returnPath = typeof returnTo === 'string' && returnTo.startsWith('/')
    ? returnTo
    : '/(tabs)/orders';

  const completeMutation = useMutation({
    mutationFn: async () => {
      const detail = await api.meals.complete(id!);
      return detail.meal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['meal', id] });
      Alert.alert('完成', '点餐已锁定', [
        { text: '确定', onPress: () => router.replace(returnPath) },
      ]);
    },
  });

  const handleComplete = () => {
    Alert.alert('确认', '确定要完成本次点餐吗？完成后将锁定不可再加菜。', [
      { text: '取消', style: 'cancel' },
      { text: '确定', onPress: () => completeMutation.mutate() },
    ]);
  };

  const handleBack = () => {
    if (typeof returnTo === 'string' && returnTo.startsWith('/')) {
      router.replace(returnPath);
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/orders');
  };

  if (isLoading) {
    return (
      <SafeScreen className="items-center justify-center">
        <Loader size={32} color="#b8a898" />
        <Text className="mt-3 text-sm text-faint">加载中...</Text>
      </SafeScreen>
    );
  }

  if (!data) {
    return (
      <SafeScreen className="items-center justify-center">
        <AlertCircle size={48} color="#e8ddd0" />
        <Text className="mt-3 text-base font-semibold text-muted">订单不存在</Text>
      </SafeScreen>
    );
  }

  const { meal, items } = data;
  const mealConfig = MEAL_TYPE_CONFIG[meal.mealType] ?? MEAL_TYPE_CONFIG.lunch;
  const isOrdering = meal.status === 'ordering';
  const canCompleteMeal = user?.actions.includes('meals.complete') ?? false;

  const totalQuantity = items.reduce((sum, item) => sum + item.totalQuantity, 0);

  return (
    <SafeScreen>
      {/* 顶部导航栏 */}
      <View className="flex-row items-center bg-bg px-4 pb-3 pt-2">
        <TouchableOpacity className="size-[38px] items-center justify-center rounded-full border border-border bg-surface" onPress={handleBack}>
          <ChevronLeft size={24} color="#2d1f14" />
        </TouchableOpacity>
        <View className="ml-3 flex-1">
          <Text className="font-display text-xl font-extrabold text-fg">进行中的一单</Text>
          <Text className="mt-0.5 text-xs text-muted">
            {mealConfig.label} · {isOrdering ? '还没出餐，随时能加菜' : '已完成'}
          </Text>
        </View>
        {isOrdering ? (
          <View className="flex-row items-center gap-1.5 rounded-full bg-herb-soft px-2.5 py-[5px]">
            <View className="size-[7px] rounded-full bg-herb" />
            <Text className="font-display text-[11px] font-bold text-herb">进行中</Text>
          </View>
        ) : (
          <View className="flex-row items-center rounded-full bg-[#f5f5f5] px-2.5 py-[5px]">
            <Text className="font-display text-[11px] font-bold text-muted">已完成</Text>
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        automaticallyAdjustContentInsets={false}
        automaticallyAdjustsScrollIndicatorInsets={false}
        contentContainerStyle={{
          paddingBottom: isOrdering && canCompleteMeal ? getBottomSafeArea(insets.bottom) + 112 : 24,
        }}
        scrollIndicatorInsets={{
          bottom: isOrdering && canCompleteMeal ? getBottomSafeArea(insets.bottom) + 88 : 0,
        }}
      >
        {/* 订单头部 */}
        <View className="mb-5 rounded-[20px] border border-border bg-surface p-4">
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-1 rounded-full bg-chef-soft px-2 py-1">
              <mealConfig.Icon size={14} color={mealConfig.fg} />
              <Text className="font-display text-xs font-bold" style={{ color: mealConfig.fg }}>{mealConfig.label}</Text>
            </View>
            <Text className="text-xs text-muted">{meal.mealDate}</Text>
          </View>
          {meal.title && (
            <Text className="mt-2.5 font-display text-[15px] font-bold text-fg">{meal.title}</Text>
          )}
        </View>

        {/* 菜品列表 */}
        <View className="mb-3 flex-row items-baseline gap-2">
          <Text className="font-display text-[17px] font-extrabold text-fg">这一单的菜</Text>
          <Text className="text-xs font-semibold text-muted">{totalQuantity} 道</Text>
        </View>

        <View className="rounded-[20px] border border-border bg-surface p-2">
          {items.map((item) => {
            const dish = item.dish;
            const quantities = item.quantities;
            const primaryUser = quantities[0];
            const whoLabel = user?.id === primaryUser?.userId ? '我' : '点';

            return (
              <TouchableOpacity
                key={dish.id}
                className="flex-row items-center gap-3 p-[11px]"
                onPress={() => router.push(`/dishes/${dish.id}`)}
                activeOpacity={0.7}
              >
                <View className="size-[50px] items-center justify-center rounded-[13px] bg-chef-soft">
                  {getImageUrl(dish.coverImage) ? (
                    <Image
                      source={{ uri: getImageUrl(dish.coverImage)! }}
                      className="size-[50px] overflow-hidden rounded-[13px]"
                      resizeMode="cover"
                    />
                  ) : (
                    <Utensils size={28} color="#c45a32" />
                  )}
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="font-display text-sm font-bold text-fg">{dish.name}</Text>
                  <View className="mt-1 flex-row items-center gap-1.5">
                    <View className="size-[18px] items-center justify-center rounded-full bg-accent">
                      <Text className="font-display text-[10px] font-bold text-white">{whoLabel}</Text>
                    </View>
                    <Text className="text-[11px] text-muted">
                      {primaryUser?.username ?? '有人'}点
                      {primaryUser?.guestName ? ` · ${primaryUser.guestName}` : ''}
                    </Text>
                  </View>
                </View>
                <Text className="font-display text-[15px] font-extrabold text-fg">×{item.totalQuantity}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 加菜按钮 */}
        {isOrdering && (
          <TouchableOpacity
            className="mt-4 flex-row items-center justify-center gap-2 rounded border-[1.5px] border-dashed border-border bg-chef-soft p-3.5"
            onPress={() => router.push('/(tabs)/meals')}
          >
            <Plus size={18} color="#c45a32" />
            <Text className="font-display text-sm font-bold text-accent">还想吃？继续加菜</Text>
          </TouchableOpacity>
        )}

        {/* 提示信息 */}
        {isOrdering && canCompleteMeal && (
          <View className="mt-3.5 flex-row items-center gap-[11px] rounded bg-[#f5f0ea] p-3">
            <Lock size={18} color="#b8a898" />
            <Text className="flex-1 text-xs leading-[18px] text-muted">
              这一单由你负责结单。结单前大家都能随时加菜。
            </Text>
          </View>
        )}
        {isOrdering && !canCompleteMeal && (
          <View className="mt-3.5 flex-row items-center gap-[11px] rounded bg-[#f5f0ea] p-3">
            <Lock size={18} color="#b8a898" />
            <Text className="flex-1 text-xs leading-[18px] text-muted">
              这一单会由有结单权限的人完成。结单前大家都能随时加菜。
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 底部按钮 */}
      {isOrdering && canCompleteMeal && (
        <View
          className="absolute bottom-0 left-0 right-0 border-t border-border bg-bg/90 px-4 pt-3"
          style={{ paddingBottom: getBottomSafeArea(insets.bottom) + 4 }}
        >
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 rounded-[14px] bg-accent py-3.5"
            style={{ shadowColor: '#c45a32', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.32, shadowRadius: 16, elevation: 4 }}
            onPress={handleComplete}
            disabled={completeMutation.isPending}
          >
            <CheckCircle size={20} color="#ffffff" />
            <Text className="font-display text-[15px] font-bold text-white">
              {completeMutation.isPending ? '处理中...' : '完成点餐'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeScreen>
  );
}
