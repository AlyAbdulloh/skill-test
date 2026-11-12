import {
  pgTable,
  serial,
  bigint,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'

// ─── ENUMS ──────────────────────────────────────────────────────
export const authModeEnum = pgEnum('auth_mode', ['local', 'sso'])

// ─── USERS ──────────────────────────────────────────────────────
export const mstUsers = pgTable('mst_users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  usernameIdx: uniqueIndex('idx_users_username').on(table.username).where(sql`${table.deletedAt} IS NULL`),
  emailIdx: uniqueIndex('idx_users_email').on(table.email).where(sql`${table.deletedAt} IS NULL`),
}))

// ─── ROLES ──────────────────────────────────────────────────────
export const mstRoles = pgTable('mst_roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  guardName: varchar('guard_name', { length: 100 }).default('web'),
  isSystem: boolean('is_system').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  nameIdx: uniqueIndex('idx_roles_name').on(table.name).where(sql`${table.deletedAt} IS NULL`),
}))

// ─── PERMISSIONS ────────────────────────────────────────────────
export const mstPermissions = pgTable('mst_permissions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  guardName: varchar('guard_name', { length: 100 }).default('web'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  nameIdx: uniqueIndex('idx_permissions_name').on(table.name).where(sql`${table.deletedAt} IS NULL`),
}))

// ─── USER ROLES (junction) ──────────────────────────────────────
export const trsUserRoles = pgTable('trs_user_roles', {
  id: serial('id').primaryKey(),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => mstUsers.id),
  roleId: bigint('role_id', { mode: 'number' }).notNull().references(() => mstRoles.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniqueUserRole: uniqueIndex('idx_user_roles_unique').on(table.userId, table.roleId),
}))

// ─── ROLE PERMISSIONS (junction) ────────────────────────────────
export const trsRolePermissions = pgTable('trs_role_permissions', {
  id: serial('id').primaryKey(),
  roleId: bigint('role_id', { mode: 'number' }).notNull().references(() => mstRoles.id),
  permissionId: bigint('permission_id', { mode: 'number' }).notNull().references(() => mstPermissions.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniqueRolePerm: uniqueIndex('idx_role_permissions_unique').on(table.roleId, table.permissionId),
}))

// ─── CATEGORIES (master data example) ───────────────────────────
export const mstCategories = pgTable('mst_categories', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 20 }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at'),
})

// ─── RELATIONS ──────────────────────────────────────────────────
export const mstUsersRelations = relations(mstUsers, ({ many }) => ({
  userRoles: many(trsUserRoles),
}))

export const mstRolesRelations = relations(mstRoles, ({ many }) => ({
  userRoles: many(trsUserRoles),
  rolePermissions: many(trsRolePermissions),
}))

export const mstPermissionsRelations = relations(mstPermissions, ({ many }) => ({
  rolePermissions: many(trsRolePermissions),
}))

export const trsUserRolesRelations = relations(trsUserRoles, ({ one }) => ({
  user: one(mstUsers, { fields: [trsUserRoles.userId], references: [mstUsers.id] }),
  role: one(mstRoles, { fields: [trsUserRoles.roleId], references: [mstRoles.id] }),
}))

export const trsRolePermissionsRelations = relations(trsRolePermissions, ({ one }) => ({
  role: one(mstRoles, { fields: [trsRolePermissions.roleId], references: [mstRoles.id] }),
  permission: one(mstPermissions, { fields: [trsRolePermissions.permissionId], references: [mstPermissions.id] }),
}))

export const mstCategoriesRelations = relations(mstCategories, () => ({}))

// ─── TYPE EXPORTS ───────────────────────────────────────────────
export type MstUser = typeof mstUsers.$inferSelect
export type NewMstUser = typeof mstUsers.$inferInsert

export type MstRole = typeof mstRoles.$inferSelect
export type NewMstRole = typeof mstRoles.$inferInsert

export type MstPermission = typeof mstPermissions.$inferSelect
export type NewMstPermission = typeof mstPermissions.$inferInsert

export type TrsUserRole = typeof trsUserRoles.$inferSelect
export type NewTrsUserRole = typeof trsUserRoles.$inferInsert

export type TrsRolePermission = typeof trsRolePermissions.$inferSelect
export type NewTrsRolePermission = typeof trsRolePermissions.$inferInsert

export type MstCategory = typeof mstCategories.$inferSelect
export type NewMstCategory = typeof mstCategories.$inferInsert

// ─── RE-EXPORTS ─────────────────────────────────────────────────
export * from './feature'
export * from './approval'

