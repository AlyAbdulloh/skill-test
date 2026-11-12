import {
  mysqlTable,
  serial,
  bigint,
  varchar,
  int,
  boolean,
  timestamp,
} from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { approvalWorkflows } from './approval'

export const mstFeatures = mysqlTable('mst_features', {
  id: serial('id').primaryKey(),
  parentId: bigint('parent_id', { mode: 'number', unsigned: true }),
  code: varchar('code', { length: 50 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  routePath: varchar('route_path', { length: 255 }).notNull(),
  icon: varchar('icon', { length: 50 }).notNull().default('LayoutDashboard'),
  sortOrder: int('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at'),
})

export const mstFeaturesRelations = relations(mstFeatures, ({ many, one }) => ({
  parent: one(mstFeatures, { fields: [mstFeatures.parentId], references: [mstFeatures.id] }),
  workflows: many(approvalWorkflows),
}))

export type MstFeature = typeof mstFeatures.$inferSelect
export type NewMstFeature = typeof mstFeatures.$inferInsert
