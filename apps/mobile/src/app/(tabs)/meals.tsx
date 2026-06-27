import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { SafeScreen } from '~/components/safe-screen';
import { api, getImageUrl } from '~/lib/api-client';
import { useCartStore } from '~/stores/cart-store';
import { FloatingCart } from '~/components/floating-cart';
import type { DishSummary, Category } from '@feed-plan/shared';

const DIFFICULTY_CONFIG: Record<string, { label: string; bg: string; fg: string }> = {
  easy: { label: '简单', bg: '#e8f5eb', fg: '#5a9a6a' },
  medium: { label: '中等', bg: '#fdf0dc', fg: '#8b6a2a' },
  hard: { label: '困难', bg: '#fae8df', fg: '#c45a32' },
};

export default function MenuScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const items = useCartStore((s) => s.items);

  const getItemQuantity = (dishId: string) => {
    return items.find((i) => i.dishId === dishId)?.quantity ?? 0;
  };

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
  });

  const { data: dishes = [], isLoading } = useQuery<DishSummary[]>({
    queryKey: ['dishes'],
    queryFn: () => api.dishes.list({ isActive: true }),
  });

  // Filter dishes by category and search
  const filteredDishes = dishes.filter((d) => {
    const matchCategory = !selectedCategory || d.categoryId === selectedCategory;
    const matchSearch = !search.trim() ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const allCategories = [{ id: 'all', name: '全部' } as Category, ...categories];

  const renderDishCard = (item: DishSummary) => {
    const difficulty = DIFFICULTY_CONFIG[item.difficulty] ?? DIFFICULTY_CONFIG.medium;

    return (
      <TouchableOpacity
        key={item.id}
        style={{
          flexDirection: 'row', alignItems: 'center', padding: 10,
          backgroundColor: '#fffcf8', borderWidth: 1, borderColor: '#e8ddd0',
          borderRadius: 14, marginBottom: 8,
        }}
        onPress={() => router.push(`/dishes/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: '#fae8df', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {getImageUrl(item.coverImage) ? (
            <Image source={{ uri: getImageUrl(item.coverImage)! }} style={{ width: 52, height: 52 }} resizeMode="cover" />
          ) : (
            <MaterialCommunityIcons name="food" size={24} color="#c45a32" />
          )}
        </View>

        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#2d1f14', fontFamily: '"Baloo 2"' }} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={{ fontSize: 11, color: '#8a7565', marginTop: 1 }} numberOfLines={1}>
            {item.description ?? item.category?.name ?? '家常美味'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <View style={{ backgroundColor: difficulty.bg, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 999 }}>
              <Text style={{ fontSize: 10, fontWeight: '600', color: difficulty.fg }}>{difficulty.label}</Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 4 }}>
          {getItemQuantity(item.id) > 0 ? (
            <>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation?.();
                  updateQuantity(item.id, getItemQuantity(item.id) - 1);
                }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: '#e8ddd0',
                  backgroundColor: '#fffcf8',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons name="minus" size={14} color="#2d1f14" />
              </TouchableOpacity>
              <Text style={{ minWidth: 20, textAlign: 'center', fontSize: 14, fontWeight: '800', fontFamily: '"Baloo 2"', color: '#2d1f14' }}>
                {getItemQuantity(item.id)}
              </Text>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation?.();
                  addItem({ dishId: item.id, name: item.name, coverImage: item.coverImage });
                }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: '#c45a32',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons name="plus" size={14} color="#ffffff" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                addItem({ dishId: item.id, name: item.name, coverImage: item.coverImage });
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#c45a32',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="plus" size={18} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeScreen>
      {/* Header */}
      <View style={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#2d1f14', fontFamily: '"Baloo 2"' }}>
          菜单
        </Text>
        <Text style={{ fontSize: 12, color: '#8a7565', marginTop: 2 }}>
          按类型浏览 · 点菜名看食材与做法
        </Text>
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 18, paddingBottom: 10 }}>
        <View
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 8,
            backgroundColor: '#fffcf8', borderWidth: 1, borderColor: '#e8ddd0',
            borderRadius: 12, paddingHorizontal: 12,
          }}
        >
          <MaterialCommunityIcons name="magnify" size={18} color="#b8a898" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="搜菜名或食材，比如 番茄、牛腩、鸡蛋…"
            placeholderTextColor="#b8a898"
            style={{ flex: 1, paddingVertical: 11, fontSize: 14, color: '#2d1f14' }}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#8a7565" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Left Category Rail + Right Dish List */}
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Left Category Rail - 25% width */}
        <View style={{ width: '25%', backgroundColor: '#f7f3ee', borderRightWidth: 1, borderRightColor: '#e8ddd0' }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
            {allCategories.map((cat) => {
              const isActive = selectedCategory === cat.id || (cat.id === 'all' && !selectedCategory);
              const count = cat.id === 'all' ? dishes.length : dishes.filter((d) => d.categoryId === cat.id).length;

              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id === 'all' ? null : cat.id)}
                  style={{
                    paddingVertical: 14, paddingHorizontal: 10, paddingLeft: 12,
                    backgroundColor: isActive ? '#fffcf8' : 'transparent',
                    borderLeftWidth: isActive ? 3 : 0, borderLeftColor: '#c45a32',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', fontFamily: '"Baloo 2"', color: isActive ? '#8b3a1e' : '#8a7565' }} numberOfLines={1}>
                    {cat.name}
                  </Text>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: isActive ? '#c45a32' : '#b8a898', marginTop: 2 }}>
                    {count} 道
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Right Dish List - 75% width */}
        <View style={{ flex: 1 }}>
          {isLoading ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <Text style={{ color: '#b8a898', fontSize: 14 }}>加载中...</Text>
            </View>
          ) : filteredDishes.length === 0 ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <MaterialCommunityIcons name="food-off" size={40} color="#e8ddd0" />
              <Text style={{ color: '#b8a898', fontSize: 13, marginTop: 8 }}>暂无菜谱</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 12, paddingBottom: 100 }}>
              {filteredDishes.map((dish) => renderDishCard(dish))}
            </ScrollView>
          )}
        </View>
      </View>

      <FloatingCart />
    </SafeScreen>
  );
}
