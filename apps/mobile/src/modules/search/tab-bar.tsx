import { Text, TouchableOpacity, View } from 'react-native';
import { cn } from '@feed-plan/shared';
import { SEARCH_TABS, type SearchTab } from './constants';
import { useSearchContext } from './context';

export function SearchTabBar() {
  const { activeTab, setActiveTab } = useSearchContext();

  return (
    <View className="border-b border-border bg-bg px-4 pb-2">
      <View className="flex-row rounded-full border border-border bg-surface p-1">
        {SEARCH_TABS.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <TouchableOpacity
              key={tab.value}
              className={cn(
                'flex-1 items-center rounded-full py-2.5',
                isActive && 'bg-fg',
              )}
              onPress={() => setActiveTab(tab.value as SearchTab)}
              activeOpacity={0.8}
            >
              <Text className={cn(
                'font-display text-[13px] font-bold',
                isActive ? 'text-white' : 'text-muted',
              )}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
