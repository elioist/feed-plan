import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, useWindowDimensions, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { SEARCH_TABS, type SearchTab } from './constants';
import { useSearchContext } from './context';
import { SearchCategoriesTab } from './tabs/categories';
import { SearchDishesTab } from './tabs/dishes';
import { SearchTagsTab } from './tabs/tags';

const SEARCH_TAB_CONTENT: Record<SearchTab, () => React.ReactNode> = {
  dishes: () => <SearchDishesTab />,
  categories: () => <SearchCategoriesTab />,
  tags: () => <SearchTagsTab />,
};

export function SearchContent() {
  const { activeTab, scrollX, setActiveTab } = useSearchContext();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [loadedTabs, setLoadedTabs] = useState<Set<SearchTab>>(() => new Set([activeTab]));

  useEffect(() => {
    const index = SEARCH_TABS.findIndex((tab) => tab.value === activeTab);
    scrollRef.current?.scrollTo({ x: index * width, y: 0, animated: true });
    setLoadedTabs((previous) => {
      const next = new Set(previous);
      next.add(activeTab);
      return next;
    });
  }, [activeTab, width]);

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    const nextTab = SEARCH_TABS[index]?.value;
    if (nextTab) setActiveTab(nextTab);
  };

  return (
    <Animated.ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      className="flex-1"
      scrollEventThrottle={16}
      onMomentumScrollEnd={handleMomentumEnd}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: true },
      )}
    >
      {SEARCH_TABS.map((tab) => (
        <View key={tab.value} className="flex-1" style={{ width }}>
          {loadedTabs.has(tab.value) ? SEARCH_TAB_CONTENT[tab.value]() : null}
        </View>
      ))}
    </Animated.ScrollView>
  );
}
