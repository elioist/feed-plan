import { useEffect, useRef } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ChevronLeft, Search, XCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSearchContext } from './context';

export function SearchHeader() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const {
    clearSearch,
    draftKeyword,
    setDraftKeyword,
    submitKeyword,
  } = useSearchContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 120);

    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/meals');
  };

  return (
    <View className="bg-bg px-4 pb-3 pt-2">
      <View className="flex-row items-center gap-2.5">
        <TouchableOpacity
          className="size-[38px] items-center justify-center rounded-full border border-border bg-surface"
          onPress={handleBack}
          activeOpacity={0.78}
        >
          <ChevronLeft size={22} color="#2d1f14" />
        </TouchableOpacity>

        <View className="h-11 flex-1 flex-row items-center gap-2 rounded-full border border-border bg-surface px-3">
          <Search size={18} color="#b8a898" />
          <TextInput
            ref={inputRef}
            value={draftKeyword}
            onChangeText={setDraftKeyword}
            onSubmitEditing={() => submitKeyword()}
            returnKeyType="search"
            placeholder="搜菜名、做法、分类或标签"
            placeholderTextColor="#b8a898"
            className="h-full flex-1 text-[15px] text-fg"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {draftKeyword ? (
            <TouchableOpacity
              onPress={clearSearch}
              hitSlop={10}
              activeOpacity={0.78}
            >
              <XCircle size={18} color="#8a7565" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={handleBack}
          hitSlop={10}
          activeOpacity={0.78}
          className="px-1"
        >
          <Text className="font-display text-[15px] font-bold text-accent">取消</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
