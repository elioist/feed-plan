import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDishDetail } from '~/lib/api/dishes';
import { getImageUrl } from '~/lib/api-client';
import { useCartStore } from '~/stores/cart-store';
import { BrandIcon } from '~/components/brand-icon';
import { openUrl } from '~/lib/utils';
import type { DishDetail } from '@feed-plan/shared';

const DIFFICULTY_LABELS: Record<string, { label: string; bg: string; fg: string }> = {
  easy: { label: '简单', bg: '#e8f5eb', fg: '#5a9a6a' },
  medium: { label: '中等', bg: '#fdf0dc', fg: '#8b6a2a' },
  hard: { label: '困难', bg: '#fae8df', fg: '#c45a32' },
};

interface Platform {
  name: string;
  color: string;
  iconifyIcon: string;
  getUrl: (keyword: string) => string;
}

const PLATFORMS: Platform[] = [
  { name: '抖音', color: '#000000', iconifyIcon: 'logos:tiktok-icon', getUrl: (k) => `https://www.douyin.com/search/${encodeURIComponent(k)}` },
  { name: '哔哩哔哩', color: '#00a1d6', iconifyIcon: 'logos:bilibili', getUrl: (k) => `https://search.bilibili.com/all?keyword=${encodeURIComponent(k)}` },
  { name: '小红书', color: '#ff2442', iconifyIcon: 'logos:xiaohongshu-icon', getUrl: (k) => `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(k)}` },
  { name: 'YouTube', color: '#ff0000', iconifyIcon: 'logos:youtube-icon', getUrl: (k) => `https://www.youtube.com/results?search_query=${encodeURIComponent(k)}` },
];

function detectPlatform(url: string): Platform | null {
  const lower = url.toLowerCase();
  if (lower.includes('douyin.com') || lower.includes('tiktok.com')) return PLATFORMS[0];
  if (lower.includes('bilibili.com') || lower.includes('b23.tv')) return PLATFORMS[1];
  if (lower.includes('xiaohongshu.com') || lower.includes('xhslink.com')) return PLATFORMS[2];
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return PLATFORMS[3];
  return null;
}

export default function DishDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addItem = useCartStore((s) => s.addItem);

  const { data: dish, isLoading } = useQuery<DishDetail>({
    queryKey: ['dish', id],
    queryFn: () => getDishDetail(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fdf6ee', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#8a7565' }}>加载中...</Text>
      </View>
    );
  }

  if (!dish) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fdf6ee', justifyContent: 'center', alignItems: 'center' }}>
        <MaterialCommunityIcons name="food-off" size={48} color="#e8ddd0" />
        <Text style={{ color: '#b8a898', marginTop: 12 }}>菜谱不存在</Text>
      </View>
    );
  }

  const difficulty = DIFFICULTY_LABELS[dish.difficulty] ?? DIFFICULTY_LABELS.medium;
  const steps = dish.recipeContent
    ? dish.recipeContent.split(/\n+/).filter((s) => s.trim())
    : [];

  // Detect platform from referenceUrl
  const detectedPlatform = dish.referenceUrl ? detectPlatform(dish.referenceUrl) : null;
  const otherPlatforms = PLATFORMS.filter((p) => p !== detectedPlatform);

  return (
    <View style={{ flex: 1, backgroundColor: '#fdf6ee' }}>
      {/* Top Bar */}
      <View
        style={{
          paddingTop: insets.top, paddingHorizontal: 16, paddingBottom: 10,
          backgroundColor: '#fdf6ee', flexDirection: 'row', alignItems: 'center', gap: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#fffcf8', borderWidth: 1, borderColor: '#e8ddd0', alignItems: 'center', justifyContent: 'center' }}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color="#2d1f14" />
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: '#2d1f14', fontFamily: '"Baloo 2"' }} numberOfLines={1}>
          {dish.name}
        </Text>
        <TouchableOpacity
          style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#fffcf8', borderWidth: 1, borderColor: '#e8ddd0', alignItems: 'center', justifyContent: 'center' }}
        >
          <MaterialCommunityIcons name="heart-outline" size={20} color="#2d1f14" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Cover */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          {getImageUrl(dish.coverImage) ? (
            <Image source={{ uri: getImageUrl(dish.coverImage)! }} style={{ width: '100%', height: 200, borderRadius: 20 }} resizeMode="cover" />
          ) : (
            <View style={{ width: '100%', height: 200, borderRadius: 20, backgroundColor: '#fae8df', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="food" size={80} color="#c45a32" />
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Category */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 4, borderRadius: 999, backgroundColor: '#fae8df', alignSelf: 'flex-start', marginBottom: 9 }}>
            <MaterialCommunityIcons name="tag-outline" size={13} color="#c45a32" />
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#8b3a1e', fontFamily: '"Baloo 2"' }}>{dish.category?.name ?? '未分类'}</Text>
          </View>

          {dish.description ? (
            <Text style={{ fontSize: 13, color: '#8a7565', lineHeight: 20, marginBottom: 16 }}>{dish.description}</Text>
          ) : null}

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
            {[
              { icon: 'clock-outline', value: dish.difficulty === 'easy' ? '15' : dish.difficulty === 'hard' ? '45' : '30', label: '分钟' },
              { icon: 'fire', value: dish.difficulty === 'easy' ? '200' : dish.difficulty === 'hard' ? '500' : '350', label: 'kcal' },
              { icon: 'account-group', value: '2', label: '人份' },
            ].map((stat) => (
              <View key={stat.label} style={{ flex: 1, backgroundColor: '#fffcf8', borderWidth: 1, borderColor: '#e8ddd0', borderRadius: 16, padding: 12, alignItems: 'center' }}>
                <MaterialCommunityIcons name={stat.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={20} color="#c45a32" />
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#2d1f14', marginTop: 4, fontFamily: '"Baloo 2"' }}>{stat.value}</Text>
                <Text style={{ fontSize: 11, color: '#8a7565' }}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Difficulty */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 11, borderRadius: 16, backgroundColor: difficulty.bg, marginBottom: 20 }}>
            <MaterialCommunityIcons name="chef-hat" size={20} color={difficulty.fg} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: difficulty.fg, fontFamily: '"Baloo 2"' }}>难度：{difficulty.label}</Text>
          </View>

          {/* Steps */}
          {steps.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: '#f7f3ee', alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialCommunityIcons name="pot-steam" size={18} color="#c45a32" />
                </View>
                <Text style={{ fontSize: 17, fontWeight: '800', color: '#2d1f14', fontFamily: '"Baloo 2"' }}>做法步骤</Text>
                <Text style={{ marginLeft: 'auto', fontSize: 12, color: '#b8a898', fontFamily: '"Baloo 2"', fontWeight: '700' }}>{steps.length} 步</Text>
              </View>
              {steps.map((step, index) => (
                <View key={index} style={{ flexDirection: 'row', gap: 13 }}>
                  <View style={{ alignItems: 'center' }}>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#c45a32', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff', fontFamily: '"Baloo 2"' }}>{index + 1}</Text>
                    </View>
                    {index < steps.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: '#e8ddd0', marginVertical: 4 }} />}
                  </View>
                  <Text style={{ flex: 1, fontSize: 14, lineHeight: 22, color: '#2d1f14', paddingBottom: 18 }}>{step}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Tips */}
          <View style={{ padding: 13, borderRadius: 16, backgroundColor: '#faf3dc', flexDirection: 'row', gap: 11, alignItems: 'flex-start', marginBottom: 20 }}>
            <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#8b6a2a" style={{ marginTop: 1 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#8b6a2a', fontFamily: '"Baloo 2"' }}>主厨小贴士</Text>
              <Text style={{ fontSize: 12, color: '#8b6a2a', lineHeight: 18, marginTop: 4 }}>
                {dish.description ?? '这道菜的关键在于火候控制，注意翻炒时间。'}
              </Text>
            </View>
          </View>

          {/* Reference Links */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 14 }}>
              <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: '#f7f3ee', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="link-variant" size={18} color="#c45a32" />
              </View>
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#2d1f14', fontFamily: '"Baloo 2"' }}>参考链接</Text>
            </View>

            {/* Primary link (detected platform) */}
            {detectedPlatform && dish.referenceUrl && (
              <TouchableOpacity
                onPress={() => openUrl(dish.referenceUrl!)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, marginBottom: 10, backgroundColor: '#fffcf8', borderWidth: 1, borderColor: '#e8ddd0', borderRadius: 16 }}
                activeOpacity={0.7}
              >
                <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: detectedPlatform.color, alignItems: 'center', justifyContent: 'center' }}>
                  <BrandIcon icon={detectedPlatform.iconifyIcon} size={24} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#2d1f14', fontFamily: '"Baloo 2"' }} numberOfLines={1}>
                    {detectedPlatform.name} · {dish.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#8a7565' }}>查看详细内容</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color="#b8a898" />
              </TouchableOpacity>
            )}

            {/* Unknown URL */}
            {dish.referenceUrl && !detectedPlatform && (
              <TouchableOpacity
                onPress={() => openUrl(dish.referenceUrl!)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, marginBottom: 10, backgroundColor: '#fffcf8', borderWidth: 1, borderColor: '#e8ddd0', borderRadius: 16 }}
                activeOpacity={0.7}
              >
                <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: '#6b7890', alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialCommunityIcons name="link" size={24} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#2d1f14', fontFamily: '"Baloo 2"' }} numberOfLines={1}>
                    {dish.name} · 参考链接
                  </Text>
                  <Text style={{ fontSize: 11, color: '#8a7565' }}>{dish.referenceUrl}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color="#b8a898" />
              </TouchableOpacity>
            )}

            {/* Search links for other platforms */}
            {otherPlatforms.map((platform) => (
              <TouchableOpacity
                key={platform.name}
                onPress={() => openUrl(platform.getUrl(dish.name))}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, marginBottom: 10, backgroundColor: '#fffcf8', borderWidth: 1, borderColor: '#e8ddd0', borderRadius: 16 }}
                activeOpacity={0.7}
              >
                <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: platform.color, alignItems: 'center', justifyContent: 'center' }}>
                  <BrandIcon icon={platform.iconifyIcon} size={24} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#2d1f14', fontFamily: '"Baloo 2"' }}>
                    {platform.name} · 搜「{dish.name}」
                  </Text>
                  <Text style={{ fontSize: 11, color: '#8a7565' }}>
                    {platform.name === 'YouTube' ? 'Search for video' : '查看相关内容'}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color="#b8a898" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          padding: 13, paddingBottom: 16,
          backgroundColor: 'rgba(255, 252, 248, 0.92)',
          borderTopWidth: 1, borderTopColor: '#e8ddd0',
        }}
      >
        <TouchableOpacity
          onPress={() => addItem({ dishId: dish.id, name: dish.name, coverImage: dish.coverImage })}
          style={{
            backgroundColor: '#c45a32', paddingVertical: 14, borderRadius: 14,
            alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
            shadowColor: '#c45a32', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.32, shadowRadius: 16, elevation: 6,
          }}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="plus" size={18} color="#ffffff" />
          <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700', fontFamily: '"Baloo 2"' }}>加入这一单</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
