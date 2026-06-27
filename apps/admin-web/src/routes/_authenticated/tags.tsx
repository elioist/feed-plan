import { createFileRoute } from '@tanstack/react-router';
import { tagListQuerySchema } from '@feed-plan/shared';
import { TagListPage } from '~/pages/tags/TagListPage';
import { tagQueries } from '~/queries/tags';

export const Route = createFileRoute('/_authenticated/tags')({
  validateSearch: (search) => tagListQuerySchema.parse(search),
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    await queryClient.ensureQueryData(tagQueries.list(deps));
  },
  component: TagListPage,
});
