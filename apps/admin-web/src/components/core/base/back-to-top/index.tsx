import { useEffect, useState } from 'react';
import { SvgIcon } from '../svg-icon';

interface BackToTopProps {
  /** 滚动容器的 id，找不到时不显示按钮 */
  targetId?: string;
  /** 滚动超过该距离（px）后显示按钮 */
  threshold?: number;
}

/** 返回顶部按钮：监听滚动容器，超过阈值后淡入，点击平滑回到顶部。 */
export function BackToTop({ targetId = 'app-main', threshold = 300 }: BackToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = document.getElementById(targetId);
    if (!container) {
      return;
    }

    const handleScroll = () => {
      setVisible(container.scrollTop > threshold);
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [targetId, threshold]);

  const scrollToTop = () => {
    document.getElementById(targetId)?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      aria-label="返回顶部"
      className={[
        'fixed bottom-10 right-10 z-50 flex size-10 items-center justify-center',
        'rounded-md border border-[var(--default-border)] bg-[var(--default-box-color)]',
        'text-lg text-[var(--gray-500)] shadow-sm transition-all duration-300',
        'hover:bg-[var(--hover-color)]',
        visible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0',
      ].join(' ')}
      type="button"
      onClick={scrollToTop}
    >
      <SvgIcon icon="ri:arrow-up-wide-line" />
    </button>
  );
}
