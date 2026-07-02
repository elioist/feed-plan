import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Text,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Utensils, Minus, Plus, AlertCircle, Sparkles } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackToTop } from '~/components/back-to-top';
import { SafeScreen } from '~/components/safe-screen';
import { FLOATING_CART_TAB_GAP, getTabBarHeight } from '~/constants/layout';
import { api, getImageUrl } from '~/lib/api-client';
import { useCartStore } from '~/stores/cart-store';
import { FloatingCart } from '~/components/floating-cart';
import { Skeleton, SkeletonCard, SkeletonText } from '~/components/ui/skeleton';
import { SearchContent } from '~/modules/search/content';
import { SearchProvider, useSearchContext } from '~/modules/search/context';
import { SearchHeader } from '~/modules/search/header';
import { SearchTabBar } from '~/modules/search/tab-bar';
import { cn, type DishSummary, type Category } from '@feed-plan/shared';
import {
  findCategoryAtPosition,
  getCategoryScrollTarget,
  getRightContentBottomSpace,
  isProgrammaticScrollSettled,
  sortCategoryOffsets,
  type CategoryOffset,
} from '~/lib/menu-scroll';

const BACK_TO_TOP_VISIBLE_Y = 360;
const BACK_TO_TOP_CART_OFFSET = 74;

const DIFFICULTY_CONFIG: Record<string, { label: string; bg: string; fg: string }> = {
  easy: { label: '简单', bg: '#e8f5eb', fg: '#5a9a6a' },
  medium: { label: '中等', bg: '#fdf0dc', fg: '#8b6a2a' },
  hard: { label: '困难', bg: '#fae8df', fg: '#c45a32' },
};

export default function MenuScreen() {
  return (
    <SearchProvider>
      <MenuScreenContent />
    </SearchProvider>
  );
}

function MenuScreenContent() {
  const insets = useSafeAreaInsets();
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [rightViewportHeight, setRightViewportHeight] = useState(0);
  const rightScrollRef = useRef<ScrollView>(null);
  const groupOffsets = useRef<Map<string, number>>(new Map());
  const sortedGroupOffsets = useRef<CategoryOffset[]>([]);
  const groupOffsetsKeyRef = useRef('');
  const programmaticTargetYRef = useRef<number | null>(null);
  const programmaticTargetCatIdRef = useRef<string | null>(null);
  const activeCatIdRef = useRef<string | null>(null);
  const showBackToTopRef = useRef(false);
  const routeCategorySyncedRef = useRef<string | null>(null);
  const router = useRouter();
  const {
    categoryTargetId,
    clearCategoryTarget,
    isFocused: isSearchFocused,
  } = useSearchContext();
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const items = useCartStore((s) => s.items);

  const getItemQuantity = (dishId: string) => items.find((i) => i.dishId === dishId)?.quantity ?? 0;
  const cartTotal = items.reduce((sum, item) => sum + item.quantity, 0);

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery<Category[]>({ queryKey: ['categories'], queryFn: () => api.categories.list() });
  const { data: dishes = [], isLoading: isDishesLoading } = useQuery<DishSummary[]>({ queryKey: ['dishes'], queryFn: () => api.dishes.list({ isActive: true }) });

  const groupedDishes = useMemo(() => categories.map((cat) => ({
    category: cat,
    dishes: dishes.filter((d) => d.categories.some((c) => c.id === cat.id)),
  })).filter((g) => g.dishes.length > 0), [categories, dishes]);

  const groupedDishesKey = groupedDishes.map((g) => g.category.id).join('|');
  if (groupOffsetsKeyRef.current !== groupedDishesKey) {
    groupOffsets.current.clear();
    sortedGroupOffsets.current = [];
    groupOffsetsKeyRef.current = groupedDishesKey;
  }

  const setActiveCategory = useCallback((catId: string | null) => {
    if (activeCatIdRef.current === catId) return;
    activeCatIdRef.current = catId;
    setActiveCatId(catId);
  }, []);

  useEffect(() => {
    if (groupedDishes.length === 0) {
      setActiveCategory(null);
      return;
    }

    const activeExists = groupedDishes.some((g) => g.category.id === activeCatId);
    if (!activeExists) {
      setActiveCategory(groupedDishes[0].category.id);
    }
  }, [groupedDishes, activeCatId, setActiveCategory]);

  const syncActiveCategoryByScrollY = useCallback((y: number) => {
    const hit = findCategoryAtPosition(sortedGroupOffsets.current, y);
    if (hit) setActiveCategory(hit);
  }, [setActiveCategory]);

  const syncBackToTopVisibility = useCallback((y: number) => {
    const nextVisible = y > BACK_TO_TOP_VISIBLE_Y;
    if (showBackToTopRef.current === nextVisible) return;

    showBackToTopRef.current = nextVisible;
    setShowBackToTop(nextVisible);
  }, []);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const targetY = programmaticTargetYRef.current;
    syncBackToTopVisibility(y);

    if (targetY !== null) {
      if (isProgrammaticScrollSettled(y, targetY)) {
        programmaticTargetYRef.current = null;
        programmaticTargetCatIdRef.current = null;
        syncActiveCategoryByScrollY(y);
      }
      return;
    }

    syncActiveCategoryByScrollY(y);
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const fallbackCatId = programmaticTargetCatIdRef.current;
    programmaticTargetYRef.current = null;
    programmaticTargetCatIdRef.current = null;
    const hit = findCategoryAtPosition(sortedGroupOffsets.current, y);
    setActiveCategory(hit ?? fallbackCatId);
  };

  const scrollToCategory = useCallback((catId: string, animated = true) => {
    const y = groupOffsets.current.get(catId);
    if (y === undefined) return false;

    const targetY = getCategoryScrollTarget(y);
    programmaticTargetYRef.current = targetY;
    programmaticTargetCatIdRef.current = catId;
    rightScrollRef.current?.scrollTo({ y: targetY, animated });
    return true;
  }, []);

  const handleCategoryPress = (catId: string) => {
    setActiveCategory(catId);
    scrollToCategory(catId);
  };

  const scrollToTop = useCallback(() => {
    programmaticTargetYRef.current = 0;
    programmaticTargetCatIdRef.current = groupedDishes[0]?.category.id ?? null;
    rightScrollRef.current?.scrollTo({ y: 0, animated: true });
    syncBackToTopVisibility(0);
  }, [groupedDishes, syncBackToTopVisibility]);

  const handleGroupLayout = useCallback((catId: string, y: number) => {
    if (groupOffsets.current.get(catId) === y && categoryTargetId !== catId) return;
    groupOffsets.current.set(catId, y);
    sortedGroupOffsets.current = sortCategoryOffsets(groupOffsets.current);

    if (categoryTargetId === catId) {
      setActiveCategory(catId);
      requestAnimationFrame(() => {
        if (scrollToCategory(catId)) clearCategoryTarget();
      });
      return;
    }

    if (categoryId === catId && routeCategorySyncedRef.current !== catId) {
      routeCategorySyncedRef.current = catId;
      setActiveCategory(catId);
      requestAnimationFrame(() => scrollToCategory(catId));
    }
  }, [categoryId, categoryTargetId, clearCategoryTarget, scrollToCategory, setActiveCategory]);

  useEffect(() => {
    if (!categoryId || !groupedDishes.some((group) => group.category.id === categoryId)) return;

    setActiveCategory(categoryId);
    if (routeCategorySyncedRef.current === categoryId) return;
    if (scrollToCategory(categoryId)) {
      routeCategorySyncedRef.current = categoryId;
    }
  }, [categoryId, groupedDishes, scrollToCategory, setActiveCategory]);

  useEffect(() => {
    if (!categoryTargetId || !groupedDishes.some((group) => group.category.id === categoryTargetId)) return;

    setActiveCategory(categoryTargetId);
    if (scrollToCategory(categoryTargetId)) {
      clearCategoryTarget();
      return;
    }

    requestAnimationFrame(() => {
      if (scrollToCategory(categoryTargetId)) clearCategoryTarget();
    });
  }, [categoryTargetId, clearCategoryTarget, groupedDishes, scrollToCategory, setActiveCategory]);

  const renderDishCard = (item: DishSummary) => {
    const diff = DIFFICULTY_CONFIG[item.difficulty] ?? DIFFICULTY_CONFIG.medium;
    const qty = getItemQuantity(item.id);
    return (
      <TouchableOpacity
        className="mb-2 flex-row items-center rounded-[14px] border border-border bg-surface p-2.5"
        onPress={() => router.push(`/dishes/${item.id}`)} activeOpacity={0.7}>
        <View className="size-[52px] items-center justify-center overflow-hidden rounded-xl bg-chef-soft">
          {getImageUrl(item.coverImage) ? <Image source={{ uri: getImageUrl(item.coverImage)! }} className="size-[52px]" resizeMode="cover" /> : <Utensils size={24} color="#c45a32" />}
        </View>
        <View className="ml-2.5 flex-1">
          <Text className="font-display text-sm font-bold text-fg" numberOfLines={1}>{item.name}</Text>
          <Text className="mt-px text-[11px] text-muted" numberOfLines={1}>{item.description}</Text>
          <View className="mt-1 self-start rounded-full px-1.5 py-px" style={{ backgroundColor: diff.bg }}>
            <Text className="text-[10px] font-semibold" style={{ color: diff.fg }}>{diff.label}</Text>
          </View>
        </View>
        <View className="ml-1 flex-row items-center gap-1">
          {qty > 0 ? (
            <>
              <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); updateQuantity(item.id, qty - 1); }}
                className="size-7 items-center justify-center rounded-full border border-border bg-surface">
                <Minus size={14} color="#2d1f14" />
              </TouchableOpacity>
              <Text className="min-w-5 text-center font-display text-sm font-extrabold text-fg">{qty}</Text>
              <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); addItem({ dishId: item.id, name: item.name, coverImage: item.coverImage }); }}
                className="size-7 items-center justify-center rounded-full bg-accent">
                <Plus size={14} color="#ffffff" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); addItem({ dishId: item.id, name: item.name, coverImage: item.coverImage }); }}
              className="size-8 items-center justify-center rounded-full bg-accent">
              <Plus size={18} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const activeCat = groupedDishes.find((g) => g.category.id === activeCatId);
  const backToTopBottom = getTabBarHeight(insets.bottom)
    + FLOATING_CART_TAB_GAP
    + (cartTotal > 0 ? BACK_TO_TOP_CART_OFFSET : 0);
  const rightContentBottomSpace = getRightContentBottomSpace(rightViewportHeight);
  const isMenuLoading = (isCategoriesLoading || isDishesLoading) && groupedDishes.length === 0;

  const renderCategorySkeleton = (key: string) => (
    <View key={key} className="border-l-[3px] border-transparent px-2.5 py-3.5 pl-3">
      <Skeleton className="h-3.5 w-12 rounded-full" />
      <Skeleton className="mt-2 h-2.5 w-8 rounded-full bg-border/40" />
    </View>
  );

  const renderMenuDishSkeleton = (key: string) => (
    <SkeletonCard key={key} className="mb-2 flex-row items-center rounded-[14px] p-2.5">
      <Skeleton className="size-[52px] rounded-xl bg-chef-soft/70" />
      <View className="ml-2.5 flex-1">
        <SkeletonText lines={2} widths={['w-2/3', 'w-full']} />
        <Skeleton className="mt-2 h-4 w-12 rounded-full bg-morning-soft/80" />
      </View>
      <Skeleton className="ml-2 size-8 rounded-full bg-chef-soft/80" />
    </SkeletonCard>
  );

  return (
    <SafeScreen>
      <View className="px-[18px] pb-2 pt-3">
        <Text className="font-display text-[22px] font-extrabold text-fg">菜单</Text>
        <Text className="mt-0.5 text-xs text-muted">按类型浏览 · 点菜名看食材与做法</Text>
      </View>

      <SearchHeader />

      {isSearchFocused ? (
        <>
          <SearchTabBar />
          <SearchContent />
        </>
      ) : (
        <View className="flex-1 flex-row">
        {/* 左侧分类 */}
        <View className="w-1/4 border-r border-border bg-[#f7f3ee]">
          <ScrollView
            showsVerticalScrollIndicator={false}
            automaticallyAdjustContentInsets={false}
            automaticallyAdjustsScrollIndicatorInsets={false}
            contentContainerClassName="py-1"
            contentContainerStyle={{ paddingBottom: getTabBarHeight(insets.bottom) + 20 }}
            scrollIndicatorInsets={{ bottom: getTabBarHeight(insets.bottom) }}
          >
            {isMenuLoading ? ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'cat-6'].map(renderCategorySkeleton) : groupedDishes.map((g) => {
              const isActive = activeCatId === g.category.id;
              return (
                <TouchableOpacity key={g.category.id} onPress={() => handleCategoryPress(g.category.id)}
                  activeOpacity={0.85}
                  className={cn(
                    'border-l-[3px] px-2.5 py-3.5 pl-3',
                    isActive ? 'border-accent bg-surface' : 'border-transparent bg-transparent',
                  )}>
                  <Text className={cn('font-display text-[13px] font-bold', isActive ? 'text-accent-ink' : 'text-muted')} numberOfLines={1}>{g.category.name}</Text>
                  <Text className={cn('mt-0.5 text-[10px] font-semibold', isActive ? 'text-accent' : 'text-faint')}>{g.dishes.length} 道</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 右侧菜品 */}
        <View className="flex-1" onLayout={(e) => setRightViewportHeight(e.nativeEvent.layout.height)}>
          {isMenuLoading ? (
            <View className="flex-1 p-3">
              <View className="h-12 flex-row items-center gap-2">
                <Skeleton className="h-4 w-[3px] rounded-sm bg-chef-soft" />
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-3 w-9 rounded-full bg-border/40" />
              </View>
              {['dish-1', 'dish-2', 'dish-3', 'dish-4', 'dish-5'].map(renderMenuDishSkeleton)}
            </View>
          ) : groupedDishes.length === 0 ? (
            <View className="flex-1 items-center justify-center"><AlertCircle size={40} color="#e8ddd0" /><Text className="mt-2 text-[13px] text-faint">暂无菜谱</Text></View>
          ) : (
            <View className="flex-1">
              {/* 吸顶标题 */}
              {activeCat && (
                <View className="absolute left-0 right-0 top-0 z-10 h-12 flex-row items-center gap-2 bg-bg px-3">
                  <View className="h-4 w-[3px] rounded-sm bg-accent" />
                  <Text className="font-display text-[15px] font-extrabold text-fg">{activeCat.category.name}</Text>
                  <Text className="text-[11px] text-faint">{activeCat.dishes.length} 道</Text>
                </View>
              )}

              <ScrollView ref={rightScrollRef} showsVerticalScrollIndicator={false}
                automaticallyAdjustContentInsets={false}
                automaticallyAdjustsScrollIndicatorInsets={false}
                contentContainerClassName="p-3 pt-0"
                scrollIndicatorInsets={{ bottom: getTabBarHeight(insets.bottom) }}
                onScroll={handleScroll}
                onMomentumScrollEnd={handleScrollEnd}
                onScrollEndDrag={handleScrollEnd}
                scrollEventThrottle={16}>
                {groupedDishes.map((group) => (
                  <View key={group.category.id} onLayout={(e) => handleGroupLayout(group.category.id, e.nativeEvent.layout.y)}>
                    <View
                      pointerEvents="none"
                      className="h-12 flex-row items-center gap-2"
                      style={{ opacity: group.category.id === activeCatId ? 0 : 1 }}
                    >
                      <View className="h-4 w-[3px] rounded-sm bg-accent" />
                      <Text className="font-display text-[15px] font-extrabold text-fg">{group.category.name}</Text>
                      <Text className="text-[11px] text-faint">{group.dishes.length} 道</Text>
                    </View>
                    {group.dishes.map((dish) => (
                      <View key={`${group.category.id}-${dish.id}`}>
                        {renderDishCard(dish)}
                      </View>
                    ))}
                  </View>
                ))}
                <View className="items-center px-3 pb-[18px] pt-2.5">
                  <View className="flex-row items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-[9px]">
                    <Sparkles size={14} color="#c45a32" />
                    <Text className="text-xs font-bold text-muted">菜单翻到底啦，喜欢哪道就放进小篮子吧</Text>
                  </View>
                </View>
                <View style={{ height: rightContentBottomSpace }} />
              </ScrollView>
              <BackToTop
                bottom={backToTopBottom}
                onPress={scrollToTop}
                visible={showBackToTop}
              />
            </View>
          )}
        </View>
      </View>
      )}

      <FloatingCart />
    </SafeScreen>
  );
}
