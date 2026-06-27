import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api, getImageUrl } from '~/lib/api-client';
import { useAuthStore } from '~/stores/auth-store';
import { SafeScreen } from '~/components/safe-screen';
import type { MenuDetail } from '@feed-plan/shared';

const MEAL_TYPE_CONFIG: Record<string, { label: string; bg: string; fg: string; icon: string }> = {
  breakfast: { label: '早餐', bg: '#fdf0dc', fg: '#8b6a2a', icon: 'weather-sunny' },
  lunch: { label: '午餐', bg: '#fae8df', fg: '#c45a32', icon: 'weather-partly-cloudy' },
  dinner: { label: '晚餐', bg: '#f0e8f5', fg: '#8b5fa8', icon: 'weather-night' },
};

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery<MenuDetail>({
    queryKey: ['meal', id],
    queryFn: () => api.meals.get(id!),
    enabled: !!id,
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      const detail = await api.meals.complete(id!);
      return detail.meal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['meal', id] });
      Alert.alert('完成', '点餐已锁定', [
        { text: '确定', onPress: () => router.replace('/meals') },
      ]);
    },
  });

  const handleComplete = () => {
    Alert.alert('确认', '确定要完成本次点餐吗？完成后将锁定不可再加菜。', [
      { text: '取消', style: 'cancel' },
      { text: '确定', onPress: () => completeMutation.mutate() },
    ]);
  };

  if (isLoading) {
    return (
      <SafeScreen style={styles.center}>
        <MaterialCommunityIcons name="loading" size={32} color="#b8a898" />
        <Text style={styles.loadingText}>加载中...</Text>
      </SafeScreen>
    );
  }

  if (!data) {
    return (
      <SafeScreen style={styles.center}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#e8ddd0" />
        <Text style={styles.emptyText}>订单不存在</Text>
      </SafeScreen>
    );
  }

  const { meal, items } = data;
  const mealConfig = MEAL_TYPE_CONFIG[meal.mealType] ?? MEAL_TYPE_CONFIG.lunch;
  const isOrdering = meal.status === 'ordering';
  const canCompleteMeal = user?.actions.includes('meals.complete') ?? false;

  const totalQuantity = items.reduce((sum, item) => sum + item.totalQuantity, 0);

  return (
    <SafeScreen style={styles.container}>
      {/* 顶部导航栏 */}
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#2d1f14" />
        </TouchableOpacity>
        <View style={styles.topbarContent}>
          <Text style={styles.topbarTitle}>进行中的一单</Text>
          <Text style={styles.topbarSubtitle}>
            {mealConfig.label} · {isOrdering ? '还没出餐，随时能加菜' : '已完成'}
          </Text>
        </View>
        <View style={styles.spacer} />
        {isOrdering ? (
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>进行中</Text>
          </View>
        ) : (
          <View style={[styles.statusPill, styles.statusDone]}>
            <Text style={[styles.statusText, styles.statusTextDone]}>已完成</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* 订单头部 */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderTop}>
            <View style={styles.mealTypeBadge}>
              <MaterialCommunityIcons name={mealConfig.icon as any} size={14} color={mealConfig.fg} />
              <Text style={[styles.mealTypeText, { color: mealConfig.fg }]}>{mealConfig.label}</Text>
            </View>
            <Text style={styles.orderDate}>{meal.mealDate}</Text>
          </View>
          {meal.title && (
            <Text style={styles.orderTitle}>{meal.title}</Text>
          )}
        </View>

        {/* 菜品列表 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>这一单的菜</Text>
          <Text style={styles.sectionCount}>{totalQuantity} 道</Text>
        </View>

        <View style={styles.dishList}>
          {items.map((item) => {
            const dish = item.dish;
            const quantities = item.quantities;
            const primaryUser = quantities[0];
            const whoLabel = user?.id === primaryUser?.userId ? '我' : '点';

            return (
              <TouchableOpacity
                key={dish.id}
                style={styles.dishItem}
                onPress={() => router.push(`/dishes/${dish.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.dishThumb}>
                  {getImageUrl(dish.coverImage) ? (
                    <Image
                      source={{ uri: getImageUrl(dish.coverImage)! }}
                      style={styles.dishThumbImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <MaterialCommunityIcons name="food" size={28} color="#c45a32" />
                  )}
                </View>
                <View style={styles.dishInfo}>
                  <Text style={styles.dishName}>{dish.name}</Text>
                  <View style={styles.dishMeta}>
                    <View style={styles.whoBadge}>
                      <Text style={styles.whoText}>{whoLabel}</Text>
                    </View>
                    <Text style={styles.dishBy}>
                      {primaryUser?.username ?? '有人'}点
                      {primaryUser?.guestName ? ` · ${primaryUser.guestName}` : ''}
                    </Text>
                  </View>
                </View>
                <Text style={styles.dishQuantity}>×{item.totalQuantity}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 加菜按钮 */}
        {isOrdering && (
          <TouchableOpacity
            style={styles.addMoreBtn}
            onPress={() => router.push('/(tabs)/meals')}
          >
            <MaterialCommunityIcons name="plus" size={18} color="#c45a32" />
            <Text style={styles.addMoreText}>还想吃？继续加菜</Text>
          </TouchableOpacity>
        )}

        {/* 提示信息 */}
        {isOrdering && canCompleteMeal && (
          <View style={styles.tipRow}>
            <MaterialCommunityIcons name="lock-outline" size={18} color="#b8a898" />
            <Text style={styles.tipText}>
              这一单由你负责结单。结单前大家都能随时加菜。
            </Text>
          </View>
        )}
        {isOrdering && !canCompleteMeal && (
          <View style={styles.tipRow}>
            <MaterialCommunityIcons name="lock-outline" size={18} color="#b8a898" />
            <Text style={styles.tipText}>
              这一单会由有结单权限的人完成。结单前大家都能随时加菜。
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 底部按钮 */}
      {isOrdering && canCompleteMeal && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={handleComplete}
            disabled={completeMutation.isPending}
          >
            <MaterialCommunityIcons name="check-circle" size={20} color="#ffffff" />
            <Text style={styles.completeBtnText}>
              {completeMutation.isPending ? '处理中...' : '完成点餐'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf6ee',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdf6ee',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#b8a898',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8a7565',
    fontWeight: '600',
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#fdf6ee',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fffcf8',
    borderWidth: 1,
    borderColor: '#e8ddd0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topbarContent: {
    flex: 1,
    marginLeft: 12,
  },
  topbarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2d1f14',
    fontFamily: '"Baloo 2"',
  },
  topbarSubtitle: {
    fontSize: 12,
    color: '#8a7565',
    marginTop: 2,
  },
  spacer: {
    flex: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#e8f5eb',
    borderRadius: 999,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#5a9a6a',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5a9a6a',
    fontFamily: '"Baloo 2"',
  },
  statusDone: {
    backgroundColor: '#f5f5f5',
  },
  statusTextDone: {
    color: '#8a7565',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  orderHeader: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#fffcf8',
    borderWidth: 1,
    borderColor: '#e8ddd0',
    marginBottom: 20,
  },
  orderHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#fae8df',
  },
  mealTypeText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: '"Baloo 2"',
  },
  orderDate: {
    fontSize: 12,
    color: '#8a7565',
  },
  orderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2d1f14',
    marginTop: 10,
    fontFamily: '"Baloo 2"',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2d1f14',
    fontFamily: '"Baloo 2"',
  },
  sectionCount: {
    fontSize: 12,
    color: '#8a7565',
    fontWeight: '600',
  },
  dishList: {
    backgroundColor: '#fffcf8',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e8ddd0',
    padding: 8,
  },
  dishItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
    gap: 12,
  },
  dishThumb: {
    width: 50,
    height: 50,
    borderRadius: 13,
    backgroundColor: '#fae8df',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dishThumbImage: {
    width: 50,
    height: 50,
    borderRadius: 13,
    overflow: 'hidden',
  },
  dishInfo: {
    flex: 1,
    minWidth: 0,
  },
  dishName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2d1f14',
    fontFamily: '"Baloo 2"',
  },
  dishMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  whoBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#c45a32',
  },
  whoText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: '"Baloo 2"',
    color: '#ffffff',
  },
  dishBy: {
    fontSize: 11,
    color: '#8a7565',
  },
  dishQuantity: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2d1f14',
    fontFamily: '"Baloo 2"',
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#e8ddd0',
    backgroundColor: '#fae8df',
  },
  addMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#c45a32',
    fontFamily: '"Baloo 2"',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginTop: 14,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#f5f0ea',
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#8a7565',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: 'rgba(253, 246, 238, 0.92)',
    borderTopWidth: 1,
    borderTopColor: '#e8ddd0',
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#c45a32',
    shadowColor: '#c45a32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 4,
  },
  completeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: '"Baloo 2"',
  },
});
