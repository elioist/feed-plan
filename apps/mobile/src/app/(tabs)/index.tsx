import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { SafeScreen } from '~/components/safe-screen';
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
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 11,
        backgroundColor: '#fffcf8',
        borderWidth: 1,
        borderColor: '#e8ddd0',
        borderRadius: 16,
        marginBottom: 10,
      }}
      onPress={() => router.push(`/dishes/${item.id}`)}
      activeOpacity={0.7}
    >
      <View
        style={{
          width: 58, height: 58, borderRadius: 14, backgroundColor: '#fae8df',
          alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}
      >
        {getImageUrl(item.coverImage) ? (
          <Image source={{ uri: getImageUrl(item.coverImage)! }} style={{ width: 58, height: 58 }} resizeMode="cover" />
        ) : (
          <MaterialCommunityIcons name="food" size={28} color="#c45a32" />
        )}
      </View>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#2d1f14', fontFamily: '"Baloo 2"' }} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={{ fontSize: 12, color: '#8a7565', marginTop: 2 }} numberOfLines={1}>
          {item.description ?? item.category?.name ?? '家常美味'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
          {item.difficulty && (
            <View style={{ backgroundColor: DIFFICULTY_CONFIG[item.difficulty]?.bg ?? '#fdf0dc', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: DIFFICULTY_CONFIG[item.difficulty]?.fg ?? '#8b6a2a' }}>
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
        style={{
          width: 34, height: 34, borderRadius: 17, backgroundColor: '#c45a32',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <MaterialCommunityIcons name="plus" size={20} color="#ffffff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeScreen>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Greeting */}
        <View style={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 8, flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#2d1f14', fontFamily: '"Baloo 2"' }}>
              {getGreeting()}，{user?.username ?? '食客'}
            </Text>
            <Text style={{ fontSize: 13, color: '#8a7565', marginTop: 2 }}>
              {getDateStr()} · 今天想吃点什么
            </Text>
          </View>
          <TouchableOpacity
            style={{
              width: 38, height: 38, borderRadius: 19, backgroundColor: '#fffcf8',
              borderWidth: 1, borderColor: '#e8ddd0', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="bell-outline" size={19} color="#2d1f14" />
          </TouchableOpacity>
        </View>

        {/* Role Badge */}
        {role && (
          <View style={{ paddingHorizontal: 18, paddingBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: role.backgroundColor, alignSelf: 'flex-start' }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: role.color, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                  {role.shortLabel}
                </Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: role.color }}>
                {role.label} · 随时点菜
              </Text>
            </View>
          </View>
        )}

        <View style={{ paddingHorizontal: 18, paddingTop: 8 }}>
          {/* Open Card */}
          <View
            style={{
              padding: 18, borderRadius: 28, marginBottom: 20,
              backgroundColor: '#c45a32',
              shadowColor: '#c45a32', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 8,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#ffffff', opacity: 0.85, letterSpacing: 0.5, fontFamily: '"Baloo 2"' }}>
              今日尚未开单
            </Text>
            <Text style={{ fontSize: 21, fontWeight: '800', color: '#ffffff', marginTop: 6, fontFamily: '"Baloo 2"' }}>
              开启今天的点单
            </Text>
            <Text style={{ fontSize: 13, color: '#ffffff', opacity: 0.9, marginTop: 4, lineHeight: 20 }}>
              开单后，你和食客都能随时加菜{'\n'}直到你这位主厨喊停。
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/cart')}
              style={{
                marginTop: 15, flexDirection: 'row', alignItems: 'center', gap: 8,
                backgroundColor: '#ffffff', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14,
                alignSelf: 'flex-start',
                shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 4,
              }}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="plus" size={18} color="#8b3a1e" />
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#8b3a1e', fontFamily: '"Baloo 2"' }}>
                我来开单
              </Text>
            </TouchableOpacity>
          </View>

          {/* Breakfast Section */}
          {dishes.length > 0 && (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <View style={{ backgroundColor: '#fdf0dc', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#8b6a2a' }}>早</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#2d1f14', fontFamily: '"Baloo 2"' }}>今日推荐</Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={() => router.push('/(tabs)/meals')}>
                  <Text style={{ fontSize: 12, color: '#8a7565', fontWeight: '600' }}>全部 ›</Text>
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
