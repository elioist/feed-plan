import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminRoutePath } from '~/components/core/layouts/navigation';

export interface WorkTabItem {
  path: AdminRoutePath;
  title: string;
  fixedTab?: boolean;
}

interface WorkTabsState {
  opened: WorkTabItem[];
  openTab: (tab: WorkTabItem) => void;
  closeTab: (path: AdminRoutePath) => void;
  closeOtherTabs: (path: AdminRoutePath) => void;
  closeLeftTabs: (path: AdminRoutePath) => void;
  closeRightTabs: (path: AdminRoutePath) => void;
  closeAllTabs: () => void;
  toggleFixedTab: (path: AdminRoutePath) => void;
}

const homeTab: WorkTabItem = {
  path: '/',
  title: '仪表盘',
  fixedTab: true,
};

export const useWorkTabsStore = create<WorkTabsState>()(
  persist(
    (set) => ({
      opened: [homeTab],
      openTab: (tab) => {
        set((state) => {
          const existingIndex = state.opened.findIndex((item) => item.path === tab.path);
          if (existingIndex >= 0) {
            const opened = [...state.opened];
            const existingTab = opened[existingIndex]!;
            opened[existingIndex] = {
              ...existingTab,
              ...tab,
              fixedTab: tab.fixedTab ?? existingTab.fixedTab,
            };
            return { opened };
          }

          return { opened: [...state.opened, tab] };
        });
      },
      closeTab: (path) => {
        set((state) => {
          const nextTabs = state.opened.filter((item) => item.fixedTab || item.path !== path);
          return { opened: nextTabs.length > 0 ? nextTabs : [homeTab] };
        });
      },
      closeOtherTabs: (path) => {
        set((state) => ({
          opened: state.opened.filter((item) => item.fixedTab || item.path === path),
        }));
      },
      closeLeftTabs: (path) => {
        set((state) => {
          const index = state.opened.findIndex((item) => item.path === path);
          if (index <= 0) {
            return state;
          }

          return {
            opened: state.opened.filter((item, itemIndex) => item.fixedTab || itemIndex >= index),
          };
        });
      },
      closeRightTabs: (path) => {
        set((state) => {
          const index = state.opened.findIndex((item) => item.path === path);
          if (index < 0 || index >= state.opened.length - 1) {
            return state;
          }

          return {
            opened: state.opened.filter((item, itemIndex) => item.fixedTab || itemIndex <= index),
          };
        });
      },
      closeAllTabs: () => set({ opened: [homeTab] }),
      toggleFixedTab: (path) => {
        set((state) => ({
          opened: state.opened.map((item) =>
            item.path === path && !item.fixedTab
              ? { ...item, fixedTab: true }
              : item.path === path && item.path !== homeTab.path
                ? { ...item, fixedTab: false }
                : item,
          ),
        }));
      },
    }),
    {
      name: 'feed-plan.admin.work-tabs',
      partialize: (state) => ({ opened: state.opened }),
    },
  ),
);
