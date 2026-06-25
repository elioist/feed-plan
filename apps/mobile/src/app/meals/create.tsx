import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, SegmentedButtons } from 'react-native-paper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { createMeal } from '~/lib/api/meals';
import type { MealType } from '@feed-plan/shared';

export default function CreateMealScreen() {
  const [mealType, setMealType] = useState<MealType>('lunch');
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => createMeal({ mealType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      router.back();
    },
  });

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.label}>
        选择餐次类型
      </Text>

      <SegmentedButtons
        value={mealType}
        onValueChange={(value) => setMealType(value as MealType)}
        buttons={[
          { value: 'breakfast', label: '早餐' },
          { value: 'lunch', label: '午餐' },
          { value: 'dinner', label: '晚餐' },
        ]}
        style={styles.segmented}
      />

      <Button
        mode="contained"
        onPress={() => createMutation.mutate()}
        loading={createMutation.isPending}
        style={styles.button}
      >
        开一单
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    marginBottom: 12,
  },
  segmented: {
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
  },
});
