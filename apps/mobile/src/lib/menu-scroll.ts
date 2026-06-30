export const CATEGORY_ACTIVATION_OFFSET = 10;
export const PROGRAMMATIC_SCROLL_THRESHOLD = 8;
export const MIN_RIGHT_CONTENT_BOTTOM_SPACE = 100;
export const RIGHT_STICKY_HEADER_HEIGHT = 48;

export type CategoryOffset = readonly [categoryId: string, offset: number];
export type CategoryOffsets = readonly CategoryOffset[] | Map<string, number>;

export function sortCategoryOffsets(offsets: Map<string, number>): CategoryOffset[] {
  return Array.from(offsets.entries()).sort((a, b) => a[1] - b[1]);
}

export function findCategoryAtPosition(
  offsets: CategoryOffsets,
  y: number,
  activationOffset = CATEGORY_ACTIVATION_OFFSET,
) {
  let hit: string | null = null;
  const sorted = offsets instanceof Map ? sortCategoryOffsets(offsets) : offsets;
  const first = sorted[0];

  if (first && y < first[1] - activationOffset) {
    return first[0];
  }

  const activationY = y + activationOffset;
  let low = 0;
  let high = sorted.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const [catId, offset] = sorted[mid];

    if (offset <= activationY) {
      hit = catId;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return hit;
}

export function getRightContentBottomSpace(layoutHeight: number) {
  return Math.max(MIN_RIGHT_CONTENT_BOTTOM_SPACE, layoutHeight * 2);
}

export function getCategoryScrollTarget(offset: number) {
  return Math.max(0, offset);
}

export function isProgrammaticScrollSettled(currentY: number, targetY: number) {
  return Math.abs(currentY - targetY) <= PROGRAMMATIC_SCROLL_THRESHOLD;
}
