import { boolean, integer, primaryKey, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

/** 用户表。授权来源只来自 user_roles。 */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 64 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  avatar: varchar('avatar', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const roles = pgTable(
  'roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    key: varchar('key', { length: 64 }).notNull(),
    name: varchar('name', { length: 64 }).notNull(),
    description: varchar('description', { length: 255 }),
    isSystem: boolean('is_system').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('roles_key_unique').on(table.key)],
);

export const userRoles = pgTable(
  'user_roles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

export const adminMenus = pgTable(
  'admin_menus',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    parentId: uuid('parent_id'),
    key: varchar('key', { length: 64 }).notNull(),
    title: varchar('title', { length: 64 }).notNull(),
    path: varchar('path', { length: 128 }),
    icon: varchar('icon', { length: 64 }),
    type: varchar('type', { length: 16 }).notNull().$type<'directory' | 'page' | 'iframe' | 'link'>(),
    componentKey: varchar('component_key', { length: 64 }),
    externalUrl: varchar('external_url', { length: 512 }),
    openInNewTab: boolean('open_in_new_tab').notNull().default(false),
    layoutKey: varchar('layout_key', { length: 32 }).notNull().default('admin').$type<'admin' | 'blank'>(),
    isCache: boolean('is_cache').notNull().default(false),
    isTabVisible: boolean('is_tab_visible').notNull().default(true),
    isAffix: boolean('is_affix').notNull().default(false),
    activeMenuKey: varchar('active_menu_key', { length: 64 }),
    sortOrder: integer('sort_order').notNull().default(0),
    isVisible: boolean('is_visible').notNull().default(true),
    isSystem: boolean('is_system').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('admin_menus_key_unique').on(table.key),
  ],
);

export const adminMenuButtons = pgTable(
  'admin_menu_buttons',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    menuId: uuid('menu_id')
      .notNull()
      .references(() => adminMenus.id, { onDelete: 'cascade' }),
    key: varchar('key', { length: 64 }).notNull(),
    name: varchar('name', { length: 64 }).notNull(),
    action: varchar('action', { length: 96 }).notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    isSystem: boolean('is_system').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('admin_menu_buttons_menu_id_key_unique').on(table.menuId, table.key),
    uniqueIndex('admin_menu_buttons_action_unique').on(table.action),
  ],
);

export const roleMenus = pgTable(
  'role_menus',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    menuId: uuid('menu_id')
      .notNull()
      .references(() => adminMenus.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.menuId] })],
);

export const roleMenuButtons = pgTable(
  'role_menu_buttons',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    buttonId: uuid('button_id')
      .notNull()
      .references(() => adminMenuButtons.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.buttonId] })],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type RoleRow = typeof roles.$inferSelect;
export type AdminMenuRow = typeof adminMenus.$inferSelect;
export type AdminMenuButtonRow = typeof adminMenuButtons.$inferSelect;
