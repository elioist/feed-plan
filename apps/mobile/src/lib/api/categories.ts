import type { Category } from '@feed-plan/shared';
import { apiClient } from '../api-client';

export async function getCategories(): Promise<Category[]> {
  return apiClient<Category[]>('/categories');
}
