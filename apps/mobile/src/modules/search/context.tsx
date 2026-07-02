import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated } from 'react-native';
import { type SearchTab } from './constants';

type SearchContextValue = {
  activeTab: SearchTab;
  categoryTargetId: string | null;
  draftKeyword: string;
  isFocused: boolean;
  submittedKeyword: string;
  selectedTag: string | null;
  scrollX: Animated.Value;
  clearCategoryTarget: () => void;
  enterSearch: () => void;
  exitSearch: () => void;
  setActiveTab: (tab: SearchTab) => void;
  setDraftKeyword: (keyword: string) => void;
  selectCategory: (categoryId: string) => void;
  submitKeyword: (keyword?: string) => void;
  clearSearch: () => void;
  selectTag: (tag: string) => void;
  clearSelectedTag: () => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<SearchTab>('dishes');
  const [categoryTargetId, setCategoryTargetId] = useState<string | null>(null);
  const [draftKeyword, setDraftKeyword] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const value = useMemo<SearchContextValue>(() => ({
    activeTab,
    categoryTargetId,
    draftKeyword,
    isFocused,
    submittedKeyword,
    selectedTag,
    scrollX,
    clearCategoryTarget: () => setCategoryTargetId(null),
    enterSearch: () => setIsFocused(true),
    exitSearch: () => {
      setIsFocused(false);
      setDraftKeyword('');
      setSubmittedKeyword('');
      setSelectedTag(null);
      setActiveTab('dishes');
    },
    setActiveTab,
    setDraftKeyword,
    selectCategory: (categoryId) => {
      setCategoryTargetId(categoryId);
      setIsFocused(false);
      setDraftKeyword('');
      setSubmittedKeyword('');
      setSelectedTag(null);
      setActiveTab('dishes');
    },
    submitKeyword: (keyword) => {
      const nextKeyword = (keyword ?? draftKeyword).trim();
      setSubmittedKeyword(nextKeyword);
      setSelectedTag(null);
    },
    clearSearch: () => {
      setDraftKeyword('');
      setSubmittedKeyword('');
      setSelectedTag(null);
      setActiveTab('dishes');
    },
    selectTag: (tag) => {
      setSelectedTag(tag);
      setDraftKeyword(tag);
      setSubmittedKeyword(tag);
      setActiveTab('dishes');
    },
    clearSelectedTag: () => setSelectedTag(null),
  }), [activeTab, categoryTargetId, draftKeyword, isFocused, scrollX, selectedTag, submittedKeyword]);

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error('useSearchContext must be used within SearchProvider');
  }

  return context;
}
