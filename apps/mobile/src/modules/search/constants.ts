export const SEARCH_TABS = [
  { value: 'dishes', label: '菜品' },
  { value: 'categories', label: '分类' },
  { value: 'tags', label: '标签' },
] as const;

export type SearchTab = (typeof SEARCH_TABS)[number]['value'];
