import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, Tags } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { type Tag } from '@feed-plan/shared';
import { api } from '~/lib/api-client';
import { Skeleton, SkeletonCard, SkeletonText } from '~/components/ui/skeleton';
import { useSearchContext } from '../context';
import { SearchEmptyState, SearchInitialState } from './empty-state';

const TagSkeleton = () => (
  <SkeletonCard className="mb-2.5 flex-row items-center rounded-[16px] p-4">
    <Skeleton className="size-10 rounded-[14px] bg-herb-soft/70" />
    <View className="ml-3 flex-1">
      <SkeletonText lines={2} widths={['w-1/2', 'w-2/5']} />
    </View>
    <Skeleton className="size-8 rounded-full bg-bg" />
  </SkeletonCard>
);

export function SearchTagsTab() {
  const { selectTag, submittedKeyword } = useSearchContext();
  const hasQuery = Boolean(submittedKeyword);

  const { data: tags = [], isLoading } = useQuery<Tag[]>({
    queryKey: ['search', 'tags', submittedKeyword],
    queryFn: () => api.tags.list({ keyword: submittedKeyword }),
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
        {isLoading ? '正在找标签...' : `找到 ${tags.length} 个标签`}
      </Text>

      {isLoading ? (
        ['tag-search-1', 'tag-search-2', 'tag-search-3', 'tag-search-4'].map((id) => (
          <TagSkeleton key={id} />
        ))
      ) : tags.length > 0 ? (
        tags.map((tag) => (
          <TouchableOpacity
            key={tag.id}
            className="mb-2.5 flex-row items-center rounded-[16px] border border-border bg-surface p-4"
            onPress={() => selectTag(tag.name)}
            activeOpacity={0.78}
          >
            <View className="size-10 items-center justify-center rounded-[14px] bg-herb-soft">
              <Tags size={20} color="#5a9a6a" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-display text-[15px] font-bold text-fg">{tag.name}</Text>
              <Text className="mt-0.5 text-xs text-muted">查看带这个标签的菜</Text>
            </View>
            <View className="size-8 items-center justify-center rounded-full bg-bg">
              <ChevronRight size={17} color="#8a7565" />
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <SearchEmptyState text="没找到匹配的标签" />
      )}
    </ScrollView>
  );
}
