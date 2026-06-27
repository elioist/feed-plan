# Admin Access Menu And Tags Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add configurable menu/button authorization, tag management, and bring category management to the same search/table/drawer layout as other admin pages.

**Architecture:** Keep backend API authorization based on action permissions, and add separate menu/button authorization resources for frontend navigation and role assignment. Tags become a managed dictionary used by dish forms and filters. Category list gains query DTOs and URL-backed admin search.

**Tech Stack:** NestJS, Drizzle ORM, PostgreSQL, Zod, pnpm workspace, React, TanStack Router/Query, Ant Design.

---

### Task 1: Shared DTOs And Database Schema

**Files:**
- Modify: `packages/shared/src/roles.ts`
- Modify: `packages/shared/src/recipes.ts`
- Modify: `packages/shared/src/index.ts`
- Modify: `packages/db/src/schema/users.ts`
- Modify: `packages/db/src/schema/recipes.ts`
- Create: `packages/db/drizzle/0007_admin_menu_tags.sql`

- [ ] Add menu schemas for `AdminMenu`, `AdminMenuButton`, create/update inputs, and role menu/button authorization payloads.
- [ ] Add tag schemas for managed tags and category query schema.
- [ ] Add Drizzle tables `admin_menus`, `admin_menu_buttons`, `role_menus`, `role_menu_buttons`, and `tags`.
- [ ] Add SQL migration for those tables and indexes.

### Task 2: Server APIs

**Files:**
- Create: `apps/server/src/auth/menus.controller.ts`
- Create: `apps/server/src/auth/menus.service.ts`
- Create: `apps/server/src/recipes/tags.controller.ts`
- Create: `apps/server/src/recipes/tags.service.ts`
- Modify: `apps/server/src/auth/auth.module.ts`
- Modify: `apps/server/src/recipes/recipes.module.ts`
- Modify: `apps/server/src/recipes/categories.controller.ts`
- Modify: `apps/server/src/recipes/categories.service.ts`
- Modify: `apps/server/src/seed.ts`

- [ ] Implement menu CRUD, tree/list reads, and role menu/button authorization replacement.
- [ ] Implement tag CRUD and search.
- [ ] Add keyword query to category list.
- [ ] Seed default menus/buttons from current admin navigation and bind all menus/buttons to `super_admin`.

### Task 3: API Client And Queries

**Files:**
- Create: `packages/api-client/src/resources/menus.ts`
- Create: `packages/api-client/src/resources/tags.ts`
- Modify: `packages/api-client/src/client.ts`
- Modify: `packages/api-client/src/index.ts`
- Modify: `packages/api-client/src/resources/categories.ts`
- Create: `apps/admin-web/src/queries/menus.ts`
- Create: `apps/admin-web/src/queries/tags.ts`
- Modify: `apps/admin-web/src/queries/categories.ts`

- [ ] Expose menu/tag/category-query resources through the shared api-client.
- [ ] Add TanStack Query wrappers with stable query keys.

### Task 4: Admin UI

**Files:**
- Create: `apps/admin-web/src/pages/menus/MenuListPage.tsx`
- Create: `apps/admin-web/src/pages/tags/TagListPage.tsx`
- Modify: `apps/admin-web/src/pages/roles/RoleListPage.tsx`
- Modify: `apps/admin-web/src/pages/categories/CategoryListPage.tsx`
- Create: `apps/admin-web/src/routes/_authenticated/menus.tsx`
- Create: `apps/admin-web/src/routes/_authenticated/tags.tsx`
- Modify: `apps/admin-web/src/routes/_authenticated/categories.tsx`
- Modify: `apps/admin-web/src/components/core/layouts/navigation.tsx`

- [ ] Build menu management page with search, table, and drawer.
- [ ] Build tag management page with search, table, and drawer.
- [ ] Add menu/button authorization controls to role drawer.
- [ ] Rebuild category page as `SearchBar + Card + DataTable + Drawer`.
- [ ] Register menu/tag routes and navigation entries.

### Task 5: Verification

**Commands:**
- `corepack pnpm --filter @feed-plan/shared typecheck`
- `corepack pnpm --filter @feed-plan/db typecheck`
- `corepack pnpm --filter @feed-plan/api-client typecheck`
- `corepack pnpm --filter @feed-plan/server typecheck`
- `corepack pnpm --filter @feed-plan/admin-web typecheck`
- `corepack pnpm --dir apps/admin-web exec vitest run src/pages/categories/CategoryListPage.test.tsx src/pages/roles/RoleListPage.test.tsx`
- `corepack pnpm --filter @feed-plan/admin-web build`
