## 1. Shared Contracts

- [x] 1.1 Add shared password schemas for changing own password and resetting a user password.
- [x] 1.2 Replace fixed role constants with dynamic role, permission, user-role, and role-permission DTO schemas.
- [x] 1.3 Export new schemas and types from `@feed-plan/shared` without exposing app-local or DB-only implementation.
- [x] 1.4 Add or update shared tests for password validation and dynamic RBAC schemas.

## 2. Database and Seed

- [x] 2.1 Add Drizzle tables for roles, permissions, user_roles, role_permissions, and permission action bindings.
- [x] 2.2 Remove the obsolete single-role `users.role` field instead of preserving compatibility.
- [x] 2.3 Seed bootstrap roles, permissions, and action bindings as editable database records.
- [ ] 2.4 Add or update db/server tests covering multi-role joins and permission summaries.

## 3. Server APIs and Authorization

- [x] 3.1 Add current-user password change endpoint with old-password verification and bcrypt hashing.
- [x] 3.2 Add reset-user-password endpoint and forbid resetting the operator's own password through this path.
- [x] 3.3 Replace fixed role guard/decorator with permission/action-based authorization.
- [x] 3.4 Update auth login and `GET /auth/me` to return roles and permissions summaries.
- [x] 3.5 Add user list/search/create/delete/update-roles APIs for multi-role users.
- [x] 3.6 Add role list/search/create/update/delete/update-permissions APIs.
- [x] 3.7 Add permission list/search/create/update/delete APIs.
- [x] 3.8 Ensure meal-ordering errors return stable status codes and readable messages for mobile clients.
- [x] 3.9 Add server unit and e2e tests for password change, password reset, dynamic RBAC restrictions, self-lockout prevention, and ordering error responses.

## 4. API Client

- [x] 4.1 Add auth or users resource methods for changing own password and resetting user password.
- [x] 4.2 Add users multi-role methods and role/permission resources.
- [x] 4.3 Reuse shared input/output types in `packages/api-client` and avoid app-local DTO duplication.
- [x] 4.4 Confirm existing meal ordering methods expose errors through `ApiError` consistently.
- [x] 4.5 Run api-client typecheck.

## 5. Admin Web

- [x] 5.1 Update user management page to search users, create users, assign multiple roles, reset passwords, delete users, and show API error messages.
- [x] 5.2 Disable dangerous self operations including self-delete, self-reset through user management, and removing the operator's last management permission.
- [x] 5.3 Replace fixed shared role matrix page with API-driven role CRUD and role-permission assignment.
- [x] 5.4 Add permission point CRUD/search UI in the role/permission management area.
- [ ] 5.5 Add or update admin tests for user creation, multi-role authorization, password reset, role CRUD, permission CRUD, and API-driven rendering.
- [ ] 5.6 Run admin-web typecheck and targeted tests.

## 6. Mobile Ordering

- [x] 6.1 Add mobile API base URL diagnostics for development, including clear guidance when network requests cannot reach the backend.
- [x] 6.2 Update cart checkout and meal-detail ordering flows to display readable `ApiError` messages.
- [x] 6.3 Handle 401 by clearing session and guiding the user to login.
- [x] 6.4 Preserve cart contents on partial or failed checkout, and refresh meal/menu queries after success or business conflicts.
- [x] 6.5 Replace fixed role display labels with auth-returned role summaries where practical.
- [x] 6.6 Run mobile typecheck.

## 7. Documentation and Verification

- [x] 7.1 Update README or mobile docs with `EXPO_PUBLIC_API_BASE` examples for simulator and physical devices.
- [x] 7.2 Run affected package typechecks: shared, db, api-client, server, admin-web, and mobile.
- [ ] 7.3 Run targeted tests for shared, server auth/meals/RBAC, admin user/role/permission management, and mobile-testable utilities.
- [x] 7.4 Run `openspec validate user-access-management-and-ordering-fix --strict`.
