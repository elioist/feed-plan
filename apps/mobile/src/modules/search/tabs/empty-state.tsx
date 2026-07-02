import { Text, View } from 'react-native';
import { Search } from 'lucide-react-native';

export function SearchInitialState() {
  return (
    <View className="items-center justify-center px-8 py-20">
      <View className="size-16 items-center justify-center rounded-[22px] bg-chef-soft">
        <Search size={30} color="#c45a32" />
      </View>
      <Text className="mt-4 font-display text-lg font-extrabold text-fg">想找哪道菜？</Text>
      <Text className="mt-1 text-center text-xs leading-5 text-faint">
        可以搜菜名、做法关键词、分类或标签。按下搜索后，厨房小本本就开始翻页。
      </Text>
    </View>
  );
}

export function SearchEmptyState({ text }: { text: string }) {
  return (
    <View className="items-center justify-center rounded-[20px] border border-dashed border-border bg-surface px-5 py-16">
      <View className="size-14 items-center justify-center rounded-[20px] bg-chef-soft">
        <Search size={26} color="#c45a32" />
      </View>
      <Text className="mt-3 font-display text-base font-bold text-muted">{text}</Text>
      <Text className="mt-1 text-center text-xs leading-5 text-faint">
        换个关键词试试，说不定它换了个名字躲起来了
      </Text>
    </View>
  );
}
