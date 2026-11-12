import 'dotenv/config'
import * as pgSchema from './pg'
import * as mysqlSchema from './mysql'

const isMysql = process.env.DB_DIALECT === 'mysql'

// Schema aktif yang dipilih berdasarkan DB_DIALECT
export const activeSchema = isMysql ? mysqlSchema : pgSchema

// Re-export individual namespaces
export { pgSchema, mysqlSchema }

// Re-export table objects dynamically based on DB_DIALECT
export const {
  authModeEnum,
  mstUsers,
  mstRoles,
  mstPermissions,
  trsUserRoles,
  trsRolePermissions,
  mstCategories,
  mstUsersRelations,
  mstRolesRelations,
  mstPermissionsRelations,
  trsUserRolesRelations,
  trsRolePermissionsRelations,
  mstCategoriesRelations,
  mstFeatures,
  mstFeaturesRelations,
  approvalWorkflows,
  approvalSteps,
  approvalInstances,
  approvalInstanceSteps,
  approvalLogs,
  approvalWorkflowsRelations,
  approvalStepsRelations,
  approvalInstancesRelations,
  approvalInstanceStepsRelations,
  approvalLogsRelations,
} = (isMysql ? mysqlSchema : pgSchema) as any

// Type exports
export type {
  MstUser,
  NewMstUser,
  MstRole,
  NewMstRole,
  MstPermission,
  NewMstPermission,
  TrsUserRole,
  NewTrsUserRole,
  TrsRolePermission,
  NewTrsRolePermission,
  MstCategory,
  NewMstCategory,
} from './pg'

export type {
  MstFeature,
  NewMstFeature,
} from './pg'

export type {
  ApprovalWorkflow,
  NewApprovalWorkflow,
  ApprovalStep,
  NewApprovalStep,
  ApprovalInstance,
  NewApprovalInstance,
  ApprovalInstanceStep,
  NewApprovalInstanceStep,
  ApprovalLog,
  NewApprovalLog,
} from './pg'