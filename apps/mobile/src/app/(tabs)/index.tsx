import { View, ScrollView, TouchableOpacity, Image, Text } from 'react-native';
import { Utensils, Plus, Bell } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeScreen } from '~/components/safe-screen';
import { getTabBarHeight } from '~/constants/layout';
import { api, getImageUrl } from '~/lib/api-client';
import { useCartStore } from '~/stores/cart-store';
import { useAuthStore } from '~/stores/auth-store';
import type { DishSummary } from '@feed-plan/shared';

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
  const role = user?.roles[0]
    ? {
        label: user.roles[0].name,
        shortLabel: user.roles[0].name.slice(0, 1),
        color: '#c45a32',
        backgroundColor: '#fae8df',
      }
    : null;

  const { data: dishes = [] } = useQuery<DishSummary[]>({
    queryKey: ['dishes'],
    queryFn: () => api.dishes.list({ isActive: true }),
  });

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

  const renderDishCard = (item: DishSummary) => (
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
            <View className="rounded-full px-[7px] py-0.5" style={{ backgroundColor: DIFFICULTY_CONFIG[item.difficulty]?.bg ?? '#fdf0dc' }}>
              <Text className="text-[11px] font-semibold" style={{ color: DIFFICULTY_CONFIG[item.difficulty]?.fg ?? '#8b6a2a' }}>
                {DIFFICULTY_CONFIG[item.difficulty]?.label ?? '中等'}
              </Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation?.();
          addItem({ dishId: item.id, name: item.name, coverImage: item.coverImage });
        }}
        className="size-[34px] items-center justify-center rounded-full bg-accent"
      >
        <Plus size={20} color="#ffffff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        automaticallyAdjustContentInsets={false}
        automaticallyAdjustsScrollIndicatorInsets={false}
        contentContainerStyle={{ paddingBottom: getTabBarHeight(insets.bottom) + 20 }}
        scrollIndicatorInsets={{ bottom: getTabBarHeight(insets.bottom) }}
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
          {/* Open Card */}
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

          {/* Breakfast Section */}
          {dishes.length > 0 && (
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
              {dishes.slice(0, 4).map((dish) => renderDishCard(dish))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
