import { useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDishes } from '~/lib/api/dishes';
import { createOrder } from '~/lib/api/orders';
import type { DishSummary } from '@feed-plan/shared';

export default function OrderScreen() {
  const { id: mealId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { data: dishes = [], isLoading } = useQuery<DishSummary[]>({
    queryKey: ['dishes'],
    queryFn: () => getDishes({ isActive: true }),
  });

  const orderMutation = useMutation({
    mutationFn: (data: { dishId: string; quantity: number }) =>
      createOrder({ mealId: mealId!, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal', mealId] });
      Alert.alert('成功', '已下单', [{ text: '确定', onPress: () => router.back() }]);
    },
  });

  const handleOrder = (dishId: string) => {
    const quantity = quantities[dishId] || 1;
    orderMutation.mutate({ dishId, quantity });
  };

  const renderDish = ({ item }: { item: DishSummary }) => (
    <Card style={styles.card}>
      <Card.Content style={styles.dishContent}>
        <View style={styles.dishInfo}>
          <Text variant="titleMedium">{item.name}</Text>
          <Text variant="bodySmall" style={styles.meta}>
            {item.category?.name ?? '未分类'}
          </Text>
        </View>

        <View style={styles.quantityRow}>
          <Button
            mode="outlined"
            compact
            onPress={() =>
              setQuantities((prev) => ({
                ...prev,
                [item.id]: Math.max(1, (prev[item.id] || 1) - 1),
              }))
            }
          >
            -
          </Button>
          <Text style={styles.quantity}>{quantities[item.id] || 1}</Text>
          <Button
            mode="outlined"
            compact
            onPress={() =>
              setQuantities((prev) => ({
                ...prev,
                [item.id]: (prev[item.id] || 1) + 1,
              }))
            }
          >
            +
          </Button>
          <Button
            mode="contained"
            compact
            onPress={() => handleOrder(item.id)}
            loading={orderMutation.isPending}
          >
            下单
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={dishes}
        keyExtractor={(item) => item.id}
        renderItem={renderDish}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>{isLoading ? '加载中...' : '暂无菜谱'}</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 12,
  },
  card: {
    marginBottom: 8,
  },
  dishContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dishInfo: {
    flex: 1,
  },
  meta: {
    color: '#666',
    marginTop: 2,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantity: {
    minWidth: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
  },
});
