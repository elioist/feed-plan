import { SafeScreen } from '~/components/safe-screen';
import { FloatingCart } from '~/components/floating-cart';
import { SearchContent } from '~/modules/search/content';
import { SearchProvider } from '~/modules/search/context';
import { SearchHeader } from '~/modules/search/header';
import { SearchTabBar } from '~/modules/search/tab-bar';

export default function SearchScreen() {
  return (
    <SearchProvider>
      <SafeScreen>
        <SearchHeader />
        <SearchTabBar />
        <SearchContent />
        <FloatingCart />
      </SafeScreen>
    </SearchProvider>
  );
}
