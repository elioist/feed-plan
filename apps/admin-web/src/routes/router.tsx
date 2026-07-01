import {
  Outlet,
  createRoute,
  createRootRouteWithContext,
  createRouter,
  lazyRouteComponent,
  redirect,
} from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import type { AnyRoute } from '@tanstack/react-router';
import type { AuthMenu, DishListQuery } from '@feed-plan/shared';
import {
  accessListQuerySchema,
  categoryListQuerySchema,
  dishListQuerySchema,
  mealQuerySchema,
  tagListQuerySchema,
  userListQuerySchema,
} from '@feed-plan/shared';
import { Result } from 'antd';
import { AppLoading } from '~/components/core/base/app-loading';
import { AppLayout } from '~/components/core/layouts/app-layout';
import { AdminRouteError } from '~/components/core/errors/route-error';
import { RouterInnerProviders } from '~/providers';
import { accessQueries } from '~/queries/access';
import { categoryQueries } from '~/queries/categories';
import { dishQueries } from '~/queries/dishes';
import { mealQueries } from '~/queries/meals';
import { tagQueries } from '~/queries/tags';
import { userQueries } from '~/queries/users';
import { useAuthStore } from '~/store/modules/auth';
import { IframePage } from '~/pages/iframe/IframePage';

export interface RouterContext {
  queryClient: QueryClient;
}

interface GetRouterInput {
  queryClient: QueryClient;
  routeMenus: AuthMenu[];
}

type RouteRegistryEntry = {
  component: ReturnType<typeof lazyRouteComponent>;
  loader?: Parameters<typeof createRoute>[0]['loader'];
  loaderDeps?: Parameters<typeof createRoute>[0]['loaderDeps'];
  validateSearch?: Parameters<typeof createRoute>[0]['validateSearch'];
};

const withDefaultDishSearch = (search: DishListQuery): DishListQuery => ({
  ...search,
  isActive: search.isActive ?? true,
});

const routeRegistry: Record<string, RouteRegistryEntry> = {
  dashboard: {
    component: lazyRouteComponent(() => import('~/pages/dashboard/DashboardPage'), 'DashboardPage'),
  },
  'recipes.categories': {
    validateSearch: (search) => categoryListQuerySchema.parse(search),
    loaderDeps: ({ search }) => search,
    loader: async ({ context: { queryClient }, deps }) => {
      await queryClient.ensureQueryData(categoryQueries.all(deps));
    },
    component: lazyRouteComponent(
      () => import('~/pages/categories/CategoryListPage'),
      'CategoryListPage',
    ),
  },
  'recipes.dishes': {
    validateSearch: (search) => dishListQuerySchema.partial().parse(search),
    loaderDeps: ({ search }) => withDefaultDishSearch(search),
    loader: async ({ context: { queryClient }, deps }) => {
      await queryClient.ensureQueryData(dishQueries.list(deps));
    },
    component: lazyRouteComponent(() => import('~/pages/dishes/DishListPage'), 'DishListPage'),
  },
  'recipes.tags': {
    validateSearch: (search) => tagListQuerySchema.parse(search),
    loaderDeps: ({ search }) => search,
    loader: async ({ context: { queryClient }, deps }) => {
      await queryClient.ensureQueryData(tagQueries.list(deps));
    },
    component: lazyRouteComponent(() => import('~/pages/tags/TagListPage'), 'TagListPage'),
  },
  meals: {
    validateSearch: (search) => mealQuerySchema.partial().parse(search),
    loaderDeps: ({ search }) => search,
    loader: async ({ context: { queryClient }, deps }) => {
      await queryClient.ensureQueryData(mealQueries.list(deps));
    },
    component: lazyRouteComponent(() => import('~/pages/meals/MealListPage'), 'MealListPage'),
  },
  'system.users': {
    validateSearch: (search) => userListQuerySchema.partial().parse(search),
    loaderDeps: ({ search }) => search,
    loader: async ({ context: { queryClient }, deps }) => {
      await Promise.all([
        queryClient.ensureQueryData(userQueries.list(deps)),
        queryClient.ensureQueryData(accessQueries.roles()),
      ]);
    },
    component: lazyRouteComponent(() => import('~/pages/users/UserListPage'), 'UserListPage'),
  },
  'system.roles': {
    validateSearch: (search) => accessListQuerySchema.partial().parse(search),
    loaderDeps: ({ search }) => search,
    loader: async ({ context: { queryClient }, deps }) => {
      await Promise.all([
        queryClient.ensureQueryData(accessQueries.roles(deps)),
        queryClient.ensureQueryData(accessQueries.menus()),
      ]);
    },
    component: lazyRouteComponent(() => import('~/pages/roles/RoleListPage'), 'RoleListPage'),
  },
  'system.menus': {
    validateSearch: (search) => accessListQuerySchema.parse(search),
    loaderDeps: ({ search }) => search,
    loader: async ({ context: { queryClient }, deps }) => {
      await queryClient.ensureQueryData(accessQueries.menus(deps));
    },
    component: lazyRouteComponent(() => import('~/pages/menus/MenuListPage'), 'MenuListPage'),
  },
};

const profileRouteEntry: RouteRegistryEntry = {
  component: lazyRouteComponent(() => import('~/pages/profile/ProfilePage'), 'ProfilePage'),
};

function RootRoute() {
  return <Outlet />;
}

function AuthenticatedRoute() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function RouteNotFound() {
  return (
    <Result status="404" title="页面不存在" subTitle="这个后台页面没有配置到当前账号的菜单中。" />
  );
}

function AdminForbidden() {
  return <Result status="403" title="访问受限" subTitle="当前账号没有可访问的后台菜单。" />;
}

function flattenMenus(items: AuthMenu[]): AuthMenu[] {
  return items.flatMap((item) => [item, ...flattenMenus(item.children)]);
}

function normalizePath(path: string | null): string | null {
  if (!path) return null;
  return path.startsWith('/') ? path : `/${path}`;
}

function isRoutableMenu(menu: AuthMenu) {
  return menu.type === 'page' || menu.type === 'iframe';
}

function findFirstRoutablePath(items: AuthMenu[]): string | null {
  for (const item of items) {
    const path = normalizePath(item.path);
    if (path && path !== '/' && isRoutableMenu(item)) {
      return path;
    }

    const childPath = findFirstRoutablePath(item.children);
    if (childPath) return childPath;
  }

  return null;
}

function createRegisteredRoute(parentRoute: AnyRoute, menu: AuthMenu) {
  const path = normalizePath(menu.path);
  if (!path) return null;

  if (menu.type === 'iframe') {
    return createRoute({
      getParentRoute: () => parentRoute,
      path,
      component: () => <IframePage title={menu.title} url={menu.externalUrl} />,
    });
  }

  if (menu.type !== 'page' || !menu.componentKey) return null;

  const entry = routeRegistry[menu.componentKey];
  if (!entry) {
    if (import.meta.env.DEV) {
      console.warn(`[router] 菜单 ${menu.key} 的 componentKey 未注册：${menu.componentKey}`);
    }
    return null;
  }

  return createRoute({
    getParentRoute: () => parentRoute,
    path,
    validateSearch: entry.validateSearch,
    loaderDeps: entry.loaderDeps,
    loader: entry.loader,
    component: entry.component,
  });
}

export function getRouter({ queryClient, routeMenus }: GetRouterInput) {
  const rootRoute = createRootRouteWithContext<RouterContext>()({
    component: RootRoute,
    errorComponent: AdminRouteError,
    notFoundComponent: RouteNotFound,
  });

  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    validateSearch: (search) => ({
      redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
    }),
    beforeLoad: () => {
      if (useAuthStore.getState().isAuthenticated()) {
        throw redirect({ to: '/' });
      }
    },
    component: lazyRouteComponent(() => import('~/pages/login/LoginPage'), 'LoginPage'),
  });

  const authenticatedRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: '_auth',
    beforeLoad: ({ location }) => {
      if (!useAuthStore.getState().isAuthenticated()) {
        throw redirect({
          to: '/login',
          search: {
            redirect: location.href,
          },
        });
      }
    },
    component: AuthenticatedRoute,
    notFoundComponent: RouteNotFound,
  });

  const flatMenus = flattenMenus(routeMenus);
  const dynamicRoutes = flatMenus
    .filter((menu) => normalizePath(menu.path) !== '/')
    .map((menu) => createRegisteredRoute(authenticatedRoute, menu))
    .filter((route): route is NonNullable<typeof route> => Boolean(route));

  const extraRoutes = [
    createRoute({
      getParentRoute: () => authenticatedRoute,
      path: '/profile',
      component: profileRouteEntry.component,
    }),
  ].filter((route): route is NonNullable<typeof route> => Boolean(route));

  const homeMenu = flatMenus.find(
    (menu) => normalizePath(menu.path) === '/' && isRoutableMenu(menu),
  );
  const firstRoutablePath = findFirstRoutablePath(routeMenus);
  const indexRouteEntry =
    homeMenu?.type === 'page'
      ? (routeRegistry[homeMenu.componentKey ?? homeMenu.key] ??
        (homeMenu.key === 'dashboard' ? routeRegistry.dashboard : undefined))
      : undefined;

  const homeIndexRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/',
    beforeLoad: () => {
      if (!homeMenu && firstRoutablePath) {
        throw redirect({ to: firstRoutablePath as never });
      }
    },
    component:
      homeMenu?.type === 'iframe'
        ? () => <IframePage title={homeMenu.title} url={homeMenu.externalUrl} />
        : (indexRouteEntry?.component ?? (routeMenus.length > 0 ? RouteNotFound : AdminForbidden)),
  });

  const routeTree = rootRoute.addChildren([
    loginRoute,
    authenticatedRoute.addChildren([...dynamicRoutes, ...extraRoutes, homeIndexRoute]),
  ]);

  return createRouter({
    routeTree,
    context: {
      queryClient,
    },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: AppLoading,
    defaultPendingMs: 100,
    defaultPendingMinMs: 200,
    defaultStructuralSharing: true,
    scrollRestoration: true,
    InnerWrap: ({ children }) => <RouterInnerProviders>{children}</RouterInnerProviders>,
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
