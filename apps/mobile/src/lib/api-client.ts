import { ofetch } from 'ofetch';
import storage from './storage';

export const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'http://localhost:3000';

export function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}

export const apiClient = ofetch.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  async onRequest({ options }) {
    const token = await storage.getItem('access_token');
    if (token) {
      const headers = new Headers(options.headers);
      headers.set('Authorization', `Bearer ${token}`);
      options.headers = headers;
    }
  },
  async onResponse({ response }) {
    if (response.status === 401) {
      await storage.deleteItem('access_token');
    }
  },
});
