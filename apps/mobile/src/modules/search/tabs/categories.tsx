import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, FolderOpen } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { type Category } from '@feed-plan/shared';
import { api } from '~/lib/api-client';
import { Skeleton, SkeletonCard, SkeletonText } from '~/components/ui/skeleton';
import { useSearchContext } from '../context';
import { SearchEmptyState, SearchInitialState } from './empty-state';

const CategorySkeleton = () => (
  <SkeletonCard className="mb-2.5 flex-row items-center rounded-[16px] p-4">
    <Skeleton className="size-10 rounded-[14px] bg-chef-soft/70" />
    <View className="ml-3 flex-1">
      <SkeletonText lines={2} widths={['w-1/2', 'w-1/3']} />
    </View>
    <Skeleton className="size-8 rounded-full bg-bg" />
  </SkeletonCard>
);

export function SearchCategoriesTab() {
  const { selectCategory, submittedKeyword } = useSearchContext();
  const hasQuery = Boolean(submittedKeyword);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['search', 'categories', submittedKeyword],
    queryFn: () => api.categories.list({ keyword: submittedKeyword }),
    enabled: hasQuery,
  });

  if (!hasQuery) return <SearchInitialState />;

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-[18px] pb-32 pt-4"
      automaticallyAdjustContentInsets={false}
      automaticallyAdjustsScrollIndicatorInsets={false}
    >
      <Text className="mb-3 text-xs font-semibold text-muted">
        {isLoading ? '正在找分类...' : `找到 ${categories.length} 个分类`}
      </Text>

      {isLoading ? (
        ['category-search-1', 'category-search-2', 'category-search-3', 'category-search-4'].map((id) => (
          <CategorySkeleton key={id} />
        ))
      ) : categories.length > 0 ? (
        categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            className="mb-2.5 flex-row items-center rounded-[16px] border border-border bg-surface p-4"
            onPress={() => selectCategory(category.id)}
            activeOpacity={0.78}
          >
            <View className="size-10 items-center justify-center rounded-[14px] bg-chef-soft">
              <FolderOpen size={20} color="#c45a32" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-display text-[15px] font-bold text-fg">{category.name}</Text>
              <Text className="mt-0.5 text-xs text-muted">去菜单里看看这一类</Text>
            </View>
            <View className="size-8 items-center justify-center rounded-full bg-bg">
              <ChevronRight size={17} color="#8a7565" />
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <SearchEmptyState text="没找到匹配的分类" />
      )}
    </ScrollView>
  );
}
