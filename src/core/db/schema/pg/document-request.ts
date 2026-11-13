import {
  pgTable,
  serial,
  bigint,
  varchar,
  text,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { mstCategories, mstUsers } from './index'

// ─── DOCUMENT REQUESTS (pengajuan dokumen) ─────────────────────
export const trsDocumentRequests = pgTable('trs_document_requests', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  categoryId: bigint('category_id', { mode: 'number' }).notNull().references(() => mstCategories.id),
  createdBy: bigint('created_by', { mode: 'number' }).references(() => mstUsers.id),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  revisionNo: integer('revision_no').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at'),
})

// ─── RELATIONS ──────────────────────────────────────────────────
export const trsDocumentRequestsRelations = relations(trsDocumentRequests, ({ one }) => ({
  category: one(mstCategories, { fields: [trsDocumentRequests.categoryId], references: [mstCategories.id] }),
  requester: one(mstUsers, { fields: [trsDocumentRequests.createdBy], references: [mstUsers.id] }),
}))

// ─── TYPE EXPORTS ───────────────────────────────────────────────
export type DocumentRequest = typeof trsDocumentRequests.$inferSelect
export type NewDocumentRequest = typeof trsDocumentRequests.$inferInsert
