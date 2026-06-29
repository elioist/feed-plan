import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button } from 'tamagui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { api } from '~/lib/api-client';
import type { MealType } from '@feed-plan/shared';

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: '早餐' },
  { value: 'lunch', label: '午餐' },
  { value: 'dinner', label: '晚餐' },
];

export default function CreateMealScreen() {
  const [mealType, setMealType] = useState<MealType>('lunch');
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const mealDate = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}-${`${now.getDate()}`.padStart(2, '0')}`;
      const detail = await api.meals.getOrCreateCurrent({
        mealDate,
        mealType,
        type: 'daily',
      });
      return detail.meal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      router.back();
    },
  });

  return (
    <View style={styles.container}>
      <Text fontSize={16} fontWeight="700" marginBottom={12}>
        选择餐次类型
      </Text>

      <View style={styles.segmented}>
        {MEAL_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => setMealType(option.value)}
            style={[
              styles.segmentBtn,
              mealType === option.value && styles.segmentBtnActive,
            ]}
          >
            <Text
              fontSize={14}
              fontWeight="600"
              color={mealType === option.value ? '#ffffff' : '#8a7565'}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        backgroundColor="#c45a32"
        color="#ffffff"
        fontWeight="700"
        fontSize={15}
        borderRadius={14}
        height={48}
        marginTop={8}
        pressStyle={{ opacity: 0.85 }}
        onPress={() => createMutation.mutate()}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? '创建中...' : '开一单'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fdf6ee',
  },
  segmented: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e8ddd0',
    backgroundColor: '#fffcf8',
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#2d1f14',
    borderColor: '#2d1f14',
  },
});
