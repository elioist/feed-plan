import { useEffect, useRef } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Search, XCircle } from 'lucide-react-native';
import { useSearchContext } from './context';

export function SearchHeader() {
  const inputRef = useRef<TextInput>(null);
  const {
    clearSearch,
    draftKeyword,
    enterSearch,
    exitSearch,
    isFocused,
    setDraftKeyword,
    submitKeyword,
  } = useSearchContext();

  useEffect(() => {
    if (isFocused) {
      inputRef.current?.focus();
      return;
    }

    inputRef.current?.blur();
  }, [isFocused]);

  return (
    <View className="bg-bg px-[18px] pb-2.5">
      <View className="flex-row items-center gap-2.5">
        <TouchableOpacity
          className="h-11 flex-1 flex-row items-center gap-2 rounded-xl border border-border bg-surface px-3"
          onPress={enterSearch}
          activeOpacity={0.78}
        >
          <Search size={18} color="#b8a898" />
          <TextInput
            ref={inputRef}
            value={draftKeyword}
            onChangeText={(value) => {
              if (!isFocused) enterSearch();
              setDraftKeyword(value);
            }}
            onFocus={enterSearch}
            onSubmitEditing={() => submitKeyword()}
            returnKeyType="search"
            placeholder="搜菜名、做法、分类或标签"
            placeholderTextColor="#b8a898"
            className="h-full flex-1 text-sm text-fg"
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
        </TouchableOpacity>

        {isFocused ? (
          <TouchableOpacity
            onPress={exitSearch}
            hitSlop={10}
            activeOpacity={0.78}
            className="px-1"
          >
            <Text className="font-display text-[15px] font-bold text-accent">取消</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
