import { View, ScrollView, TouchableOpacity, Image, Text } from 'react-native';
import { AlertCircle, ArrowLeft, Heart, Utensils, Tag, Clock, Users, ChefHat, Lightbulb, Link, ChevronRight, Plus, Flame, Minus, ShoppingCart } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, getImageUrl } from '~/lib/api-client';
import { useCartStore } from '~/stores/cart-store';
import { BrandIcon } from '~/components/brand-icon';
import { openUrl } from '~/lib/utils';
import { getBottomSafeArea } from '~/constants/layout';
import type { DishDetail } from '@feed-plan/shared';
import { Skeleton, SkeletonCard, SkeletonText } from '~/components/ui/skeleton';

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
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.totalItems);

  const { data: dish, isLoading } = useQuery<DishDetail>({
    queryKey: ['dish', id],
    queryFn: () => api.dishes.get(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg">
        <View
          className="flex-row items-center gap-2.5 bg-bg px-4 pb-2.5"
          style={{ paddingTop: insets.top }}
        >
          <Skeleton className="size-[38px] rounded-full bg-surface" />
          <Skeleton className="h-5 flex-1 rounded-full" />
          <Skeleton className="size-[38px] rounded-full bg-surface" />
        </View>
        <ScrollView
          className="flex-1"
          automaticallyAdjustContentInsets={false}
          automaticallyAdjustsScrollIndicatorInsets={false}
          contentContainerStyle={{ paddingBottom: getBottomSafeArea(insets.bottom) + 96 }}
          scrollIndicatorInsets={{ bottom: getBottomSafeArea(insets.bottom) + 80 }}
        >
          <View className="mb-4 px-5">
            <Skeleton className="h-[200px] w-full rounded-[20px] bg-chef-soft/70" />
          </View>
          <View className="px-5">
            <Skeleton className="mb-[9px] h-6 w-20 rounded-full bg-chef-soft/70" />
            <SkeletonText className="mb-4" lines={2} widths={['w-full', 'w-4/5']} />
            <View className="mb-3.5 flex-row gap-2.5">
              {['time', 'calorie', 'people'].map((item) => (
                <SkeletonCard key={item} className="h-[86px] flex-1 rounded p-3" />
              ))}
            </View>
            <Skeleton className="mb-5 h-[42px] rounded bg-morning-soft/80" />
            <View className="mb-5">
              <View className="mb-3.5 flex-row items-center gap-[9px]">
                <Skeleton className="size-[30px] rounded-[9px] bg-chef-soft/70" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </View>
              {['step-1', 'step-2', 'step-3'].map((item) => (
                <View key={item} className="mb-4 flex-row gap-[13px]">
                  <Skeleton className="size-7 rounded-full bg-chef-soft/80" />
                  <SkeletonText className="flex-1" lines={2} widths={['w-full', 'w-4/5']} />
                </View>
              ))}
            </View>
            <SkeletonCard className="mb-5 h-[84px] rounded" />
            <SkeletonCard className="mb-2.5 h-[70px] rounded" />
            <SkeletonCard className="mb-2.5 h-[70px] rounded" />
          </View>
        </ScrollView>
        <View
          className="absolute bottom-0 left-0 right-0 flex-row items-center gap-2.5 border-t border-border bg-surface/90 p-[13px]"
          style={{ paddingBottom: getBottomSafeArea(insets.bottom) + 4 }}
        >
          <Skeleton className="size-12 rounded-[14px] bg-chef-soft/80" />
          <Skeleton className="h-12 flex-1 rounded-[14px] bg-chef-soft/80" />
        </View>
      </View>
    );
  }

  if (!dish) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <AlertCircle size={48} color="#e8ddd0" />
        <Text className="mt-3 text-faint">菜谱不存在</Text>
      </View>
    );
  }

  const difficulty = DIFFICULTY_LABELS[dish.difficulty] ?? DIFFICULTY_LABELS.medium;
  const quantity = items.find((item) => item.dishId === dish.id)?.quantity ?? 0;
  const total = totalItems();
  const steps = dish.recipeContent
    ? dish.recipeContent.split(/\n+/).filter((s) => s.trim())
    : [];

  // Detect platform from referenceUrl
  const detectedPlatform = dish.referenceUrl ? detectPlatform(dish.referenceUrl) : null;
  const otherPlatforms = PLATFORMS.filter((p) => p !== detectedPlatform);
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/meals');
  };

  return (
    <View className="flex-1 bg-bg">
      {/* Top Bar */}
      <View
        className="flex-row items-center gap-2.5 bg-bg px-4 pb-2.5"
        style={{ paddingTop: insets.top }}
      >
        <TouchableOpacity
          onPress={handleBack}
          className="size-[38px] items-center justify-center rounded-full border border-border bg-surface"
        >
          <ArrowLeft size={20} color="#2d1f14" />
        </TouchableOpacity>
        <Text className="flex-1 font-display text-[17px] font-bold text-fg" numberOfLines={1}>
          {dish.name}
        </Text>
        <TouchableOpacity
          className="size-[38px] items-center justify-center rounded-full border border-border bg-surface"
        >
          <Heart size={20} color="#2d1f14" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        automaticallyAdjustContentInsets={false}
        automaticallyAdjustsScrollIndicatorInsets={false}
        contentContainerStyle={{ paddingBottom: getBottomSafeArea(insets.bottom) + 96 }}
        scrollIndicatorInsets={{ bottom: getBottomSafeArea(insets.bottom) + 80 }}
      >
        {/* Cover */}
        <View className="mb-4 px-5">
          {getImageUrl(dish.coverImage) ? (
            <Image source={{ uri: getImageUrl(dish.coverImage)! }} className="h-[200px] w-full rounded-[20px]" resizeMode="cover" />
          ) : (
            <View className="h-[200px] w-full items-center justify-center rounded-[20px] bg-chef-soft">
              <Utensils size={80} color="#c45a32" />
            </View>
          )}
        </View>

        <View className="px-5">
          {/* Category */}
          <View className="mb-[9px] flex-row items-center gap-1.5 self-start rounded-full bg-chef-soft px-[11px] py-1">
            <Tag size={13} color="#c45a32" />
            <Text className="font-display text-[11px] font-bold text-accent-ink">{dish.categories?.[0]?.name}</Text>
          </View>

          {dish.description ? (
            <Text className="mb-4 text-[13px] leading-5 text-muted">{dish.description}</Text>
          ) : null}

          {/* Stats */}
          <View className="mb-3.5 flex-row gap-2.5">
            {[
              { Icon: Clock, value: dish.difficulty === 'easy' ? '15' : dish.difficulty === 'hard' ? '45' : '30', label: '分钟' },
              { Icon: Flame, value: dish.difficulty === 'easy' ? '200' : dish.difficulty === 'hard' ? '500' : '350', label: 'kcal' },
              { Icon: Users, value: '2', label: '人份' },
            ].map((stat) => (
              <View key={stat.label} className="flex-1 items-center rounded border border-border bg-surface p-3">
                <stat.Icon size={20} color="#c45a32" />
                <Text className="mt-1 font-display text-base font-extrabold text-fg">{stat.value}</Text>
                <Text className="text-[11px] text-muted">{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Difficulty */}
          <View className="mb-5 flex-row items-center gap-2.5 rounded p-[11px]" style={{ backgroundColor: difficulty.bg }}>
            <ChefHat size={20} color={difficulty.fg} />
            <Text className="font-display text-xs font-bold" style={{ color: difficulty.fg }}>难度：{difficulty.label}</Text>
          </View>

          {/* Steps */}
          {steps.length > 0 && (
            <View className="mb-5">
              <View className="mb-3.5 flex-row items-center gap-[9px]">
                <View className="size-[30px] items-center justify-center rounded-[9px] bg-[#f7f3ee]">
                  <Utensils size={18} color="#c45a32" />
                </View>
                <Text className="font-display text-[17px] font-extrabold text-fg">做法步骤</Text>
                <Text className="ml-auto font-display text-xs font-bold text-faint">{steps.length} 步</Text>
              </View>
              {steps.map((step, index) => (
                <View key={index} className="flex-row gap-[13px]">
                  <View className="items-center">
                    <View className="size-7 items-center justify-center rounded-full bg-accent">
                      <Text className="font-display text-[13px] font-extrabold text-white">{index + 1}</Text>
                    </View>
                    {index < steps.length - 1 && <View className="my-1 w-0.5 flex-1 bg-border" />}
                  </View>
                  <Text className="flex-1 pb-[18px] text-sm leading-[22px] text-fg">{step}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Tips */}
          <View className="mb-5 flex-row items-start gap-[11px] rounded bg-yolk-soft p-[13px]">
            <Lightbulb size={20} color="#8b6a2a" />
            <View className="flex-1">
              <Text className="font-display text-[13px] font-bold text-[#8b6a2a]">主厨小贴士</Text>
              <Text className="mt-1 text-xs leading-[18px] text-[#8b6a2a]">
                {dish.description ?? '这道菜的关键在于火候控制，注意翻炒时间。'}
              </Text>
            </View>
          </View>

          {/* Reference Links */}
          <View className="mb-5">
            <View className="mb-3.5 flex-row items-center gap-[9px]">
              <View className="size-[30px] items-center justify-center rounded-[9px] bg-[#f7f3ee]">
                <Link size={18} color="#c45a32" />
              </View>
              <Text className="font-display text-[17px] font-extrabold text-fg">参考链接</Text>
            </View>

            {/* Primary link (detected platform) */}
            {detectedPlatform && dish.referenceUrl && (
              <TouchableOpacity
                onPress={() => openUrl(dish.referenceUrl!)}
                className="mb-2.5 flex-row items-center gap-[13px] rounded border border-border bg-surface p-3.5"
                activeOpacity={0.7}
              >
                <View className="size-[42px] items-center justify-center rounded-xl" style={{ backgroundColor: detectedPlatform.color }}>
                  <BrandIcon icon={detectedPlatform.iconifyIcon} size={24} />
                </View>
                <View className="flex-1">
                  <Text className="font-display text-sm font-bold text-fg" numberOfLines={1}>
                    {detectedPlatform.name} · {dish.name}
                  </Text>
                  <Text className="text-[11px] text-muted">查看详细内容</Text>
                </View>
                <ChevronRight size={18} color="#b8a898" />
              </TouchableOpacity>
            )}

            {/* Unknown URL */}
            {dish.referenceUrl && !detectedPlatform && (
              <TouchableOpacity
                onPress={() => openUrl(dish.referenceUrl!)}
                className="mb-2.5 flex-row items-center gap-[13px] rounded border border-border bg-surface p-3.5"
                activeOpacity={0.7}
              >
                <View className="size-[42px] items-center justify-center rounded-xl bg-[#6b7890]">
                  <Link size={24} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="font-display text-sm font-bold text-fg" numberOfLines={1}>
                    {dish.name} · 参考链接
                  </Text>
                  <Text className="text-[11px] text-muted">{dish.referenceUrl}</Text>
                </View>
                <ChevronRight size={18} color="#b8a898" />
              </TouchableOpacity>
            )}

            {/* Search links for other platforms */}
            {otherPlatforms.map((platform) => (
              <TouchableOpacity
                key={platform.name}
                onPress={() => openUrl(platform.getUrl(dish.name))}
                className="mb-2.5 flex-row items-center gap-[13px] rounded border border-border bg-surface p-3.5"
                activeOpacity={0.7}
              >
                <View className="size-[42px] items-center justify-center rounded-xl" style={{ backgroundColor: platform.color }}>
                  <BrandIcon icon={platform.iconifyIcon} size={24} />
                </View>
                <View className="flex-1">
                  <Text className="font-display text-sm font-bold text-fg">
                    {platform.name} · 搜「{dish.name}」
                  </Text>
                  <Text className="text-[11px] text-muted">
                    {platform.name === 'YouTube' ? 'Search for video' : '查看相关内容'}
                  </Text>
                </View>
                <ChevronRight size={18} color="#b8a898" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View
        className="absolute bottom-0 left-0 right-0 flex-row items-center gap-2.5 border-t border-border bg-surface/90 p-[13px]"
        style={{
          paddingBottom: getBottomSafeArea(insets.bottom) + 4,
        }}
      >
        {quantity > 0 ? (
          <View className="h-12 flex-row items-center gap-2 rounded-[14px] border border-border bg-surface px-2.5">
            <TouchableOpacity
              onPress={() => updateQuantity(dish.id, quantity - 1)}
              className="size-[30px] items-center justify-center rounded-full border border-border bg-surface"
              activeOpacity={0.8}
            >
              <Minus size={15} color="#2d1f14" />
            </TouchableOpacity>
            <Text className="min-w-[22px] text-center font-display text-base font-extrabold text-fg">{quantity}</Text>
            <TouchableOpacity
              onPress={() => addItem({ dishId: dish.id, name: dish.name, coverImage: dish.coverImage })}
              className="size-[30px] items-center justify-center rounded-full bg-accent"
              activeOpacity={0.8}
            >
              <Plus size={15} color="#ffffff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => addItem({ dishId: dish.id, name: dish.name, coverImage: dish.coverImage })}
            className="size-12 items-center justify-center rounded-[14px] bg-accent"
            activeOpacity={0.85}
          >
            <Plus size={20} color="#ffffff" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/cart')}
          className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-[14px] bg-accent"
          style={{ shadowColor: '#c45a32', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.32, shadowRadius: 16, elevation: 6 }}
          activeOpacity={0.85}
        >
          <ShoppingCart size={18} color="#ffffff" />
          <Text className="font-display text-[15px] font-bold text-white">{total > 0 ? `${total} 道菜 · 去下单` : '购物车空空，先挑一道'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
