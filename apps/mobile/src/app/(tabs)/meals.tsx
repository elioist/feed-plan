import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Text } from 'tamagui';
import { Utensils, Minus, Plus, Search, XCircle, AlertCircle, Sparkles } from '@tamagui/lucide-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { SafeScreen } from '~/components/safe-screen';
import { api, getImageUrl } from '~/lib/api-client';
import { useCartStore } from '~/stores/cart-store';
import { FloatingCart } from '~/components/floating-cart';
import type { DishSummary, Category } from '@feed-plan/shared';
import {
  findCategoryAtPosition,
  getCategoryScrollTarget,
  getRightContentBottomSpace,
  isProgrammaticScrollSettled,
  RIGHT_STICKY_HEADER_HEIGHT,
  sortCategoryOffsets,
  type CategoryOffset,
} from '~/lib/menu-scroll';

const DIFFICULTY_CONFIG: Record<string, { label: string; bg: string; fg: string }> = {
  easy: { label: '简单', bg: '#e8f5eb', fg: '#5a9a6a' },
  medium: { label: '中等', bg: '#fdf0dc', fg: '#8b6a2a' },
  hard: { label: '困难', bg: '#fae8df', fg: '#c45a32' },
};

export default function MenuScreen() {
  const [search, setSearch] = useState('');
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [rightViewportHeight, setRightViewportHeight] = useState(0);
  const rightScrollRef = useRef<ScrollView>(null);
  const groupOffsets = useRef<Map<string, number>>(new Map());
  const sortedGroupOffsets = useRef<CategoryOffset[]>([]);
  const groupOffsetsKeyRef = useRef('');
  const programmaticTargetYRef = useRef<number | null>(null);
  const programmaticTargetCatIdRef = useRef<string | null>(null);
  const activeCatIdRef = useRef<string | null>(null);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const items = useCartStore((s) => s.items);

  const getItemQuantity = (dishId: string) => items.find((i) => i.dishId === dishId)?.quantity ?? 0;

  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ['categories'], queryFn: () => api.categories.list() });
  const { data: dishes = [], isLoading } = useQuery<DishSummary[]>({ queryKey: ['dishes'], queryFn: () => api.dishes.list({ isActive: true }) });

  const groupedDishes = useMemo(() => categories.map((cat) => ({
    category: cat,
    dishes: dishes.filter((d) => {
      const inCat = d.categories.some((c) => c.id === cat.id);
      const matchSearch = !search.trim() || d.name.toLowerCase().includes(search.toLowerCase()) || d.description?.toLowerCase().includes(search.toLowerCase());
      return inCat && matchSearch;
    }),
  })).filter((g) => g.dishes.length > 0), [categories, dishes, search]);

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

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const targetY = programmaticTargetYRef.current;

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

  const handleCategoryPress = (catId: string) => {
    setActiveCategory(catId);
    const y = groupOffsets.current.get(catId);
    if (y !== undefined) {
      const targetY = getCategoryScrollTarget(y);
      programmaticTargetYRef.current = targetY;
      programmaticTargetCatIdRef.current = catId;
      rightScrollRef.current?.scrollTo({ y: targetY, animated: true });
    }
  };

  const handleGroupLayout = useCallback((catId: string, y: number) => {
    if (groupOffsets.current.get(catId) === y) return;
    groupOffsets.current.set(catId, y);
    sortedGroupOffsets.current = sortCategoryOffsets(groupOffsets.current);
  }, []);

  const renderDishCard = (item: DishSummary) => {
    const diff = DIFFICULTY_CONFIG[item.difficulty] ?? DIFFICULTY_CONFIG.medium;
    const qty = getItemQuantity(item.id);
    return (
      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fffcf8', borderWidth: 1, borderColor: '#e8ddd0', borderRadius: 14, marginBottom: 8 }}
        onPress={() => router.push(`/dishes/${item.id}`)} activeOpacity={0.7}>
        <View style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: '#fae8df', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {getImageUrl(item.coverImage) ? <Image source={{ uri: getImageUrl(item.coverImage)! }} style={{ width: 52, height: 52 }} resizeMode="cover" /> : <Utensils size={24} color="#c45a32" />}
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#2d1f14', fontFamily: '"Baloo 2"' }} numberOfLines={1}>{item.name}</Text>
          <Text style={{ fontSize: 11, color: '#8a7565', marginTop: 1 }} numberOfLines={1}>{item.description}</Text>
          <View style={{ backgroundColor: diff.bg, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 999, marginTop: 4, alignSelf: 'flex-start' }}>
            <Text style={{ fontSize: 10, fontWeight: '600', color: diff.fg }}>{diff.label}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 4 }}>
          {qty > 0 ? (
            <>
              <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); updateQuantity(item.id, qty - 1); }}
                style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#e8ddd0', backgroundColor: '#fffcf8', alignItems: 'center', justifyContent: 'center' }}>
                <Minus size={14} color="#2d1f14" />
              </TouchableOpacity>
              <Text style={{ minWidth: 20, textAlign: 'center', fontSize: 14, fontWeight: '800', fontFamily: '"Baloo 2"', color: '#2d1f14' }}>{qty}</Text>
              <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); addItem({ dishId: item.id, name: item.name, coverImage: item.coverImage }); }}
                style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#c45a32', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={14} color="#ffffff" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); addItem({ dishId: item.id, name: item.name, coverImage: item.coverImage }); }}
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#c45a32', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={18} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const activeCat = groupedDishes.find((g) => g.category.id === activeCatId);
  const rightContentBottomSpace = getRightContentBottomSpace(rightViewportHeight);

  return (
    <SafeScreen>
      <View style={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#2d1f14', fontFamily: '"Baloo 2"' }}>菜单</Text>
        <Text style={{ fontSize: 12, color: '#8a7565', marginTop: 2 }}>按类型浏览 · 点菜名看食材与做法</Text>
      </View>

      <View style={{ paddingHorizontal: 18, paddingBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fffcf8', borderWidth: 1, borderColor: '#e8ddd0', borderRadius: 12, paddingHorizontal: 12 }}>
          <Search size={18} color="#b8a898" />
          <TextInput value={search} onChangeText={setSearch} placeholder="搜菜名或食材" placeholderTextColor="#b8a898" style={{ flex: 1, paddingVertical: 11, fontSize: 14, color: '#2d1f14' }} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><XCircle size={18} color="#8a7565" /></TouchableOpacity> : null}
        </View>
      </View>

      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* 左侧分类 */}
        <View style={{ width: '25%', backgroundColor: '#f7f3ee', borderRightWidth: 1, borderRightColor: '#e8ddd0' }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
            {groupedDishes.map((g) => {
              const isActive = activeCatId === g.category.id;
              return (
                <TouchableOpacity key={g.category.id} onPress={() => handleCategoryPress(g.category.id)}
                  activeOpacity={0.85}
                  style={{ paddingVertical: 14, paddingHorizontal: 10, paddingLeft: 12, backgroundColor: isActive ? '#fffcf8' : 'transparent', borderLeftWidth: isActive ? 3 : 0, borderLeftColor: '#c45a32' }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', fontFamily: '"Baloo 2"', color: isActive ? '#8b3a1e' : '#8a7565' }} numberOfLines={1}>{g.category.name}</Text>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: isActive ? '#c45a32' : '#b8a898', marginTop: 2 }}>{g.dishes.length} 道</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 右侧菜品 */}
        <View style={{ flex: 1 }} onLayout={(e) => setRightViewportHeight(e.nativeEvent.layout.height)}>
          {isLoading ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}><Text style={{ color: '#b8a898', fontSize: 14 }}>加载中...</Text></View>
          ) : groupedDishes.length === 0 ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}><AlertCircle size={40} color="#e8ddd0" /><Text style={{ color: '#b8a898', fontSize: 13, marginTop: 8 }}>暂无菜谱</Text></View>
          ) : (
            <View style={{ flex: 1 }}>
              {/* 吸顶标题 */}
              {activeCat && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, height: RIGHT_STICKY_HEADER_HEIGHT, paddingHorizontal: 12, backgroundColor: '#fdf6ee', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: '#c45a32' }} />
                  <Text style={{ fontSize: 15, fontWeight: '800', color: '#2d1f14', fontFamily: '"Baloo 2"' }}>{activeCat.category.name}</Text>
                  <Text style={{ fontSize: 11, color: '#b8a898' }}>{activeCat.dishes.length} 道</Text>
                </View>
              )}

              <ScrollView ref={rightScrollRef} showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 12, paddingTop: 0, paddingBottom: 12 }}
                onScroll={handleScroll}
                onMomentumScrollEnd={handleScrollEnd}
                onScrollEndDrag={handleScrollEnd}
                scrollEventThrottle={16}>
                {groupedDishes.map((group) => (
                  <View key={group.category.id} onLayout={(e) => handleGroupLayout(group.category.id, e.nativeEvent.layout.y)}>
                    <View
                      pointerEvents="none"
                      style={{ height: RIGHT_STICKY_HEADER_HEIGHT, flexDirection: 'row', alignItems: 'center', gap: 8, opacity: group.category.id === activeCatId ? 0 : 1 }}
                    >
                      <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: '#c45a32' }} />
                      <Text style={{ fontSize: 15, fontWeight: '800', color: '#2d1f14', fontFamily: '"Baloo 2"' }}>{group.category.name}</Text>
                      <Text style={{ fontSize: 11, color: '#b8a898' }}>{group.dishes.length} 道</Text>
                    </View>
                    {group.dishes.map((dish) => (
                      <View key={`${group.category.id}-${dish.id}`}>
                        {renderDishCard(dish)}
                      </View>
                    ))}
                  </View>
                ))}
                <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 18, paddingHorizontal: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: '#fffcf8', borderWidth: 1, borderColor: '#e8ddd0' }}>
                    <Sparkles size={14} color="#c45a32" />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#8a7565' }}>菜单翻到底啦，喜欢哪道就放进小篮子吧</Text>
                  </View>
                </View>
                <View style={{ height: rightContentBottomSpace }} />
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      <FloatingCart />
    </SafeScreen>
  );
}
