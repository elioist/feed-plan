import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Minus, Plus, Tag, Utensils, X } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { type DishSummary } from '@feed-plan/shared';
import { api, getImageUrl } from '~/lib/api-client';
import { useCartStore } from '~/stores/cart-store';
import { Skeleton, SkeletonCard, SkeletonText } from '~/components/ui/skeleton';
import { useSearchContext } from '../context';
import { SearchEmptyState, SearchInitialState } from './empty-state';

const DIFFICULTY_CONFIG: Record<string, { label: string; bg: string; fg: string }> = {
  easy: { label: '简单', bg: '#e8f5eb', fg: '#5a9a6a' },
  medium: { label: '中等', bg: '#fdf0dc', fg: '#8b6a2a' },
  hard: { label: '困难', bg: '#fae8df', fg: '#c45a32' },
};

const DishSkeleton = () => (
  <SkeletonCard className="mb-2.5 flex-row items-center rounded-[16px] p-[11px]">
    <Skeleton className="size-[58px] rounded-[14px] bg-chef-soft/70" />
    <View className="ml-3 flex-1">
      <SkeletonText lines={2} widths={['w-2/3', 'w-full']} />
      <Skeleton className="mt-2 h-5 w-14 rounded-full bg-morning-soft/80" />
    </View>
    <Skeleton className="ml-2 size-[34px] rounded-full bg-chef-soft/80" />
  </SkeletonCard>
);

export function SearchDishesTab() {
  const router = useRouter();
  const {
    clearSelectedTag,
    selectedTag,
    submittedKeyword,
  } = useSearchContext();
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const items = useCartStore((state) => state.items);

  const hasQuery = Boolean(submittedKeyword || selectedTag);
  const { data: dishes = [], isLoading } = useQuery<DishSummary[]>({
    queryKey: ['search', 'dishes', { keyword: submittedKeyword, tag: selectedTag }],
    queryFn: () => api.dishes.list({
      isActive: true,
      ...(selectedTag ? { tag: selectedTag } : { keyword: submittedKeyword }),
    }),
    enabled: hasQuery,
  });

  const getItemQuantity = (dishId: string) =>
    items.find((item) => item.dishId === dishId)?.quantity ?? 0;

  const renderDish = (dish: DishSummary) => {
    const quantity = getItemQuantity(dish.id);
    const difficulty = DIFFICULTY_CONFIG[dish.difficulty] ?? DIFFICULTY_CONFIG.medium;

    return (
      <TouchableOpacity
        key={dish.id}
        className="mb-2.5 flex-row items-center rounded-[16px] border border-border bg-surface p-[11px]"
        onPress={() => router.push(`/dishes/${dish.id}`)}
        activeOpacity={0.75}
      >
        <View className="size-[58px] items-center justify-center overflow-hidden rounded-[14px] bg-chef-soft">
          {getImageUrl(dish.coverImage) ? (
            <Image source={{ uri: getImageUrl(dish.coverImage)! }} className="size-[58px]" resizeMode="cover" />
          ) : (
            <Utensils size={28} color="#c45a32" />
          )}
        </View>
        <View className="ml-3 flex-1">
          <Text className="font-display text-[15px] font-bold text-fg" numberOfLines={1}>
            {dish.name}
          </Text>
          <Text className="mt-0.5 text-xs text-muted" numberOfLines={1}>
            {dish.description}
          </Text>
          <View className="mt-1.5 flex-row flex-wrap items-center gap-1.5">
            <View className="rounded-full px-[7px] py-0.5" style={{ backgroundColor: difficulty.bg }}>
              <Text className="text-[11px] font-semibold" style={{ color: difficulty.fg }}>
                {difficulty.label}
              </Text>
            </View>
            {dish.categories.slice(0, 1).map((category) => (
              <View key={category.id} className="rounded-full bg-bg px-[7px] py-0.5">
                <Text className="text-[11px] font-semibold text-muted">{category.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="ml-1 flex-row items-center gap-1">
          {quantity > 0 ? (
            <>
              <TouchableOpacity
                onPress={(event) => {
                  event.stopPropagation?.();
                  updateQuantity(dish.id, quantity - 1);
                }}
                className="size-7 items-center justify-center rounded-full border border-border bg-surface"
              >
                <Minus size={14} color="#2d1f14" />
              </TouchableOpacity>
              <Text className="min-w-5 text-center font-display text-sm font-extrabold text-fg">
                {quantity}
              </Text>
              <TouchableOpacity
                onPress={(event) => {
                  event.stopPropagation?.();
                  addItem({ dishId: dish.id, name: dish.name, coverImage: dish.coverImage });
                }}
                className="size-7 items-center justify-center rounded-full bg-accent"
              >
                <Plus size={14} color="#ffffff" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={(event) => {
                event.stopPropagation?.();
                addItem({ dishId: dish.id, name: dish.name, coverImage: dish.coverImage });
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

  if (!hasQuery) return <SearchInitialState />;

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-[18px] pb-32 pt-4"
      automaticallyAdjustContentInsets={false}
      automaticallyAdjustsScrollIndicatorInsets={false}
    >
      {selectedTag ? (
        <View className="mb-3 flex-row items-center self-start rounded-full bg-herb-soft px-3 py-1.5">
          <Tag size={14} color="#5a9a6a" />
          <Text className="ml-1.5 text-xs font-bold text-herb">标签：{selectedTag}</Text>
          <TouchableOpacity className="ml-2" onPress={clearSelectedTag} hitSlop={8}>
            <X size={13} color="#5a9a6a" />
          </TouchableOpacity>
        </View>
      ) : null}

      <Text className="mb-3 text-xs font-semibold text-muted">
        {isLoading ? '正在翻菜单...' : `找到 ${dishes.length} 道菜`}
      </Text>

      {isLoading ? (
        ['dish-search-1', 'dish-search-2', 'dish-search-3', 'dish-search-4', 'dish-search-5'].map((id) => (
          <DishSkeleton key={id} />
        ))
      ) : dishes.length > 0 ? (
        dishes.map(renderDish)
      ) : (
        <SearchEmptyState text="没找到匹配的菜" />
      )}
    </ScrollView>
  );
}
