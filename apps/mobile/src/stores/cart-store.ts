import { create } from 'zustand';
import type { MealType } from '@feed-plan/shared';

export interface CartItem {
  dishId: string;
  name: string;
  coverImage: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  mealType: MealType;
  note: string;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  setMealType: (mealType: MealType) => void;
  setNote: (note: string) => void;
  clearCart: () => void;
  totalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  mealType: 'lunch',
  note: '',

  addItem: (item) => {
    set((state) => {
      const existing = state.items.find((i) => i.dishId === item.dishId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.dishId === item.dishId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    });
  },

  removeItem: (dishId) => {
    set((state) => ({
      items: state.items.filter((i) => i.dishId !== dishId),
    }));
  },

  updateQuantity: (dishId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(dishId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.dishId === dishId ? { ...i, quantity } : i
      ),
    }));
  },

  setMealType: (mealType) => set({ mealType }),
  setNote: (note) => set({ note }),
  clearCart: () => set({ items: [], note: '' }),

  totalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
