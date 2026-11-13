import {
  pgTable,
  serial,
  bigint,
  varchar,
  integer,
  boolean,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { mstUsers, mstCategories, trsDocumentRequests } from './index'

// ─── APPROVAL WORKFLOWS (template per category) ────────────────
export const approvalWorkflows = pgTable('approval_workflows', {
  id: serial('id').primaryKey(),
  categoryId: bigint('category_id', { mode: 'number' }).notNull().references(() => mstCategories.id),
  divisionId: bigint('division_id', { mode: 'number' }),
  departmentId: bigint('department_id', { mode: 'number' }),
  name: varchar('name', { length: 100 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
})

// ─── APPROVAL STEPS (sequential / parallel) ─────────────────────
export const approvalSteps = pgTable('approval_steps', {
  id: serial('id').primaryKey(),
  workflowId: bigint('workflow_id', { mode: 'number' }).notNull().references(() => approvalWorkflows.id),
  step: integer('step').notNull(),
  groupNo: integer('group_no').default(1),
  code: varchar('code', { length: 50 }),
  approverType: varchar('approver_type', { length: 20 }).notNull(),
  jobLevelId: bigint('job_level_id', { mode: 'number' }),
  userId: bigint('user_id', { mode: 'number' }).references(() => mstUsers.id),
  divisionId: bigint('division_id', { mode: 'number' }),
  jobPositionId: bigint('job_position_id', { mode: 'number' }),
  groupType: varchar('group_type', { length: 20 }).default('SEQUENTIAL'),
  minApproval: integer('min_approval').default(1),
  isRequired: boolean('is_required').default(true),
  allowedActions: varchar('allowed_actions', { length: 255 }).default('approve,reject'),
  createdAt: timestamp('created_at').defaultNow(),
})

// ─── APPROVAL INSTANCES (per transaction) ───────────────────────
export const approvalInstances = pgTable('approval_instances', {
  id: serial('id').primaryKey(),
  workflowId: bigint('workflow_id', { mode: 'number' }).notNull().references(() => approvalWorkflows.id),
  modelType: varchar('model_type', { length: 100 }).notNull(),
  modelId: varchar('model_id', { length: 36 }).notNull(),
  currentStep: integer('current_step').default(1),
  status: varchar('status', { length: 20 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
})

// ─── APPROVAL INSTANCE STEPS (real approver per instance) ───────
export const approvalInstanceSteps = pgTable('approval_instance_steps', {
  id: serial('id').primaryKey(),
  instanceId: bigint('instance_id', { mode: 'number' }).notNull().references(() => approvalInstances.id),
  stepId: bigint('step_id', { mode: 'number' }).notNull().references(() => approvalSteps.id),
  approverUserId: bigint('approver_user_id', { mode: 'number' }).notNull().references(() => mstUsers.id),
  status: varchar('status', { length: 20 }).default('pending'),
  approvedAt: timestamp('approved_at'),
  employeeName: varchar('employee_name', { length: 100 }),
  employeePosition: varchar('employee_position', { length: 100 }),
  divisionName: varchar('division_name', { length: 100 }),
  signature: text('signature'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
})

// ─── APPROVAL LOGS (audit trail) ────────────────────────────────
export const approvalLogs = pgTable('approval_logs', {
  id: serial('id').primaryKey(),
  instanceStepId: bigint('instance_step_id', { mode: 'number' }).notNull().references(() => approvalInstanceSteps.id),
  action: varchar('action', { length: 20 }).notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
})

// ─── APPROVAL INBOX (pending approver per request) ──────────────
export const approvalInbox = pgTable('approval_inbox', {
  id: serial('id').primaryKey(),
  documentRequestId: bigint('document_request_id', { mode: 'number' }).notNull().references(() => trsDocumentRequests.id),
  approverId: bigint('approver_id', { mode: 'number' }).notNull().references(() => mstUsers.id),
  createdAt: timestamp('created_at').defaultNow(),
})

// ─── RELATIONS ──────────────────────────────────────────────────
export const approvalWorkflowsRelations = relations(approvalWorkflows, ({ one, many }) => ({
  category: one(mstCategories, { fields: [approvalWorkflows.categoryId], references: [mstCategories.id] }),
  steps: many(approvalSteps),
  instances: many(approvalInstances),
}))

export const approvalStepsRelations = relations(approvalSteps, ({ one }) => ({
  workflow: one(approvalWorkflows, { fields: [approvalSteps.workflowId], references: [approvalWorkflows.id] }),
  user: one(mstUsers, { fields: [approvalSteps.userId], references: [mstUsers.id] }),
}))

export const approvalInstancesRelations = relations(approvalInstances, ({ one, many }) => ({
  workflow: one(approvalWorkflows, { fields: [approvalInstances.workflowId], references: [approvalWorkflows.id] }),
  instanceSteps: many(approvalInstanceSteps),
}))

export const approvalInstanceStepsRelations = relations(approvalInstanceSteps, ({ one, many }) => ({
  instance: one(approvalInstances, { fields: [approvalInstanceSteps.instanceId], references: [approvalInstances.id] }),
  step: one(approvalSteps, { fields: [approvalInstanceSteps.stepId], references: [approvalSteps.id] }),
  approver: one(mstUsers, { fields: [approvalInstanceSteps.approverUserId], references: [mstUsers.id] }),
  logs: many(approvalLogs),
}))

export const approvalLogsRelations = relations(approvalLogs, ({ one }) => ({
  instanceStep: one(approvalInstanceSteps, { fields: [approvalLogs.instanceStepId], references: [approvalInstanceSteps.id] }),
}))

export const approvalInboxRelations = relations(approvalInbox, ({ one }) => ({
  documentRequest: one(trsDocumentRequests, { fields: [approvalInbox.documentRequestId], references: [trsDocumentRequests.id] }),
  approver: one(mstUsers, { fields: [approvalInbox.approverId], references: [mstUsers.id] }),
}))

// ─── TYPE EXPORTS ───────────────────────────────────────────────
export type ApprovalWorkflow = typeof approvalWorkflows.$inferSelect
export type NewApprovalWorkflow = typeof approvalWorkflows.$inferInsert

export type ApprovalStep = typeof approvalSteps.$inferSelect
export type NewApprovalStep = typeof approvalSteps.$inferInsert

export type ApprovalInstance = typeof approvalInstances.$inferSelect
export type NewApprovalInstance = typeof approvalInstances.$inferInsert

export type ApprovalInstanceStep = typeof approvalInstanceSteps.$inferSelect
export type NewApprovalInstanceStep = typeof approvalInstanceSteps.$inferInsert

export type ApprovalLog = typeof approvalLogs.$inferSelect
export type NewApprovalLog = typeof approvalLogs.$inferInsert

export type ApprovalInbox = typeof approvalInbox.$inferSelect
export type NewApprovalInbox = typeof approvalInbox.$inferInsert
