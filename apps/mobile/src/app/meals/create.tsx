import { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { SafeScreen } from '~/components/safe-screen';
import { api } from '~/lib/api-client';
import { cn, type MealType } from '@feed-plan/shared';

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
    <SafeScreen className="p-4">
      <Text className="mb-3 text-base font-bold text-fg">
        选择餐次类型
      </Text>

      <View className="mb-6 flex-row gap-2">
        {MEAL_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => setMealType(option.value)}
            className={cn(
              'flex-1 items-center rounded-xl border-[1.5px] py-2.5',
              mealType === option.value ? 'border-fg bg-fg' : 'border-border bg-surface',
            )}
          >
            <Text
              className={cn('text-sm font-semibold', mealType === option.value ? 'text-white' : 'text-muted')}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        className="mt-2 h-12 items-center justify-center rounded-[14px] bg-accent"
        onPress={() => createMutation.mutate()}
        disabled={createMutation.isPending}
        activeOpacity={0.85}
      >
        <Text className="font-display text-[15px] font-bold text-white">
          {createMutation.isPending ? '创建中...' : '开一单'}
        </Text>
      </TouchableOpacity>
    </SafeScreen>
  );
}
