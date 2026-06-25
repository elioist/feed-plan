import type { Order } from '@feed-plan/shared';
import { apiClient } from '../api-client';

export async function createOrder(data: {
  mealId: string;
  dishId: string;
  quantity: number;
  note?: string;
}): Promise<Order> {
  return apiClient<Order>('/orders', {
    method: 'POST',
    body: data,
  });
}
