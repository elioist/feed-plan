export const TAB_BAR_CONTENT_HEIGHT = 48;
export const TAB_BAR_TOP_PADDING = 8;
export const MIN_BOTTOM_SAFE_AREA = 8;
export const FLOATING_CART_TAB_GAP = 10;

export function getBottomSafeArea(insetBottom: number) {
  return Math.max(insetBottom, MIN_BOTTOM_SAFE_AREA);
}

export function getTabBarHeight(insetBottom: number) {
  return TAB_BAR_TOP_PADDING + TAB_BAR_CONTENT_HEIGHT + getBottomSafeArea(insetBottom);
}
