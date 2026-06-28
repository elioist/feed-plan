import { adminStorageNS } from '@feed-plan/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WorkTabItem {
  path: string;
  title: string;
  fixedTab?: boolean;
}

interface WorkTabsState {
  opened: WorkTabItem[];
  openTab: (tab: WorkTabItem) => void;
  closeTab: (path: string) => void;
  closeOtherTabs: (path: string) => void;
  closeLeftTabs: (path: string) => void;
  closeRightTabs: (path: string) => void;
  closeAllTabs: () => void;
  toggleFixedTab: (path: string) => void;
}

export const useWorkTabsStore = create<WorkTabsState>()(
  persist(
    (set) => ({
      opened: [],
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
          return { opened: nextTabs };
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
      closeAllTabs: () => set({ opened: [] }),
      toggleFixedTab: (path) => {
        set((state) => ({
          opened: state.opened.map((item) =>
            item.path === path && !item.fixedTab
              ? { ...item, fixedTab: true }
              : item.path === path
                ? { ...item, fixedTab: false }
                : item,
          ),
        }));
      },
    }),
    {
      name: adminStorageNS('work-tabs'),
      partialize: (state) => ({ opened: state.opened }),
    },
  ),
);

export function clearWorkTabsCache() {
  useWorkTabsStore.setState({ opened: [] });
  useWorkTabsStore.persist.clearStorage();
}
