import { View, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getMealDetail, completeMeal } from '~/lib/api/meals';
import { useAuthStore } from '~/stores/auth-store';
import type { Meal } from '@feed-plan/shared';

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
};

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const { data: meal, isLoading } = useQuery<Meal>({
    queryKey: ['meal', id],
    queryFn: () => getMealDetail(id!),
    enabled: !!id,
  });

  const completeMutation = useMutation({
    mutationFn: () => completeMeal(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['meal', id] });
      Alert.alert('完成', '点餐已锁定');
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
      <View style={styles.center}>
        <Text>加载中...</Text>
      </View>
    );
  }

  if (!meal) {
    return (
      <View style={styles.center}>
        <Text>菜单不存在</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.header}>
        <Card.Content>
          <Text variant="headlineSmall">{MEAL_TYPE_LABELS[meal.mealType]}</Text>
          <Text variant="bodyMedium" style={styles.meta}>
            {meal.mealDate} · {meal.status === 'ordering' ? '进行中' : '已完成'}
          </Text>
        </Card.Content>
      </Card>

      {meal.status === 'ordering' && user?.role === 'chef' ? (
        <Button
          mode="contained"
          onPress={handleComplete}
          loading={completeMutation.isPending}
          style={styles.completeButton}
        >
          完成点餐
        </Button>
      ) : null}

      {meal.status === 'ordering' ? (
        <Button
          mode="outlined"
          onPress={() => router.push(`/meals/${id}/order`)}
          style={styles.orderButton}
        >
          加菜
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 12,
  },
  meta: {
    color: '#666',
    marginTop: 4,
  },
  completeButton: {
    marginBottom: 8,
  },
  orderButton: {
    marginBottom: 8,
  },
});
