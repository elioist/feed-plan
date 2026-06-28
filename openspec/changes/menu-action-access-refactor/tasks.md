## 1. Shared Contracts

- [x] 1.1 Replace permission DTO exports with menu route manifest and action authorization DTOs.
- [x] 1.2 Extend menu schemas with `type`, `componentKey`, `externalUrl`, `openInNewTab`, `layoutKey`, `isCache`, `isTabVisible`, `isAffix`, and `activeMenuKey`.
- [x] 1.3 Update auth user schemas to remove `permissions` and keep roles, menuKeys, buttonKeys, and actions derived from menu buttons.
- [x] 1.4 Add shared tests for menu type validation, external URL requirements, and action key validation.

## 2. Database and Seed

- [x] 2.1 Add a breaking migration that removes or fully deprecates permissions, role_permissions, and permission_action_bindings from business use.
- [x] 2.2 Extend `admin_menus` with route metadata fields and menu type constraints.
- [x] 2.3 Ensure `admin_menu_buttons.action` is required, unique enough for authorization, and seeded for all protected operations.
- [x] 2.4 Update seed so super_admin receives all menus/buttons, chef receives chef menus/buttons, and diner receives no Admin menus.
- [x] 2.5 Add or update db/server tests for role-menu and role-button joins.

## 3. Server Authorization and APIs

- [x] 3.1 Replace AccessGuard permission lookup with role menu/button action lookup.
- [x] 3.2 Add menu-level access decorator or equivalent for page/read endpoints that should depend on menu access.
- [x] 3.3 Migrate every `@RequireAccess(...)` usage to the new action constants backed by menu buttons.
- [x] 3.4 Remove permissions controller/service methods from public API.
- [x] 3.5 Add `GET /auth/menus` or equivalent current-user route manifest endpoint.
- [x] 3.6 Keep full `/menus` management endpoints protected by the menu management button action.
- [x] 3.7 Update auth login and `GET /auth/me` to return the new authorization summary.
- [x] 3.8 Add server unit/e2e tests for super_admin, chef, diner, forbidden actions, current-user menus, and self-lockout prevention.

## 4. API Client

- [x] 4.1 Remove permissions resource and its exports.
- [x] 4.2 Extend menus resource with current-user menu manifest and expanded menu CRUD fields.
- [x] 4.3 Update users/roles/auth resources and types for permission removal.
- [x] 4.4 Run api-client typecheck.

## 5. Admin Dynamic Routing

- [x] 5.1 Replace business use of `routeTree.gen.ts` with a code-based dynamic route builder.
- [x] 5.2 Add a route registry mapping backend `componentKey` values to lazy page imports.
- [x] 5.3 Add router bootstrap/loading flow that restores session, loads current-user menus, builds routes, then renders RouterProvider.
- [x] 5.4 Add route guards for direct URL access, unknown component keys, 403, and 404.
- [x] 5.5 Add `IframePage` and link click handling for iframe/link menu types.
- [ ] 5.6 Add page cache container using `isCache` route metadata.
- [x] 5.7 Update WorkTabs and active menu logic to use backend route metadata.

## 6. Admin Management UI

- [x] 6.1 Remove permissions page, route, queries, tests, and navigation entry.
- [x] 6.2 Update menu management page to edit menu type, component key, external URL, open mode, layout, cache, tab visibility, affix, active menu, and button actions.
- [x] 6.3 Update role management page to authorize menus and menu buttons only.
- [x] 6.4 Update button permission hook and all pages to use menu button keys/actions consistently.
- [x] 6.5 Add admin tests for dynamic menus, role menu/button authorization, link/iframe behavior, and removed permission page.

## 7. Verification and Archive Readiness

- [x] 7.1 Run affected typechecks: shared, db, api-client, server, admin-web.
- [x] 7.2 Run targeted tests for server auth/access, admin layout/routing/menu/role pages, and shared schemas.
- [x] 7.3 Run `openspec validate menu-action-access-refactor --strict`.
- [ ] 7.4 After implementation and verification, archive the change and ensure current specs no longer mention standalone permission point management.
