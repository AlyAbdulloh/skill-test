export interface ApprovalLine {
  id: number
  categoryId: number
  categoryName?: string
  categoryCode?: string
  divisionId?: number | null
  departmentId?: number | null
  name: string
  isActive: boolean
  stepsCount?: number
  createdAt: string
  updatedAt: string
}

export interface ApprovalLineStep {
  id: number
  workflowId: number
  step: number
  groupNo: number
  code?: string | null
  approverType: string
  jobLevelId?: number | null
  userId?: number | null
  userName?: string | null
  divisionId?: number | null
  jobPositionId?: number | null
  groupType: string
  minApproval: number
  isRequired: boolean
  allowedActions: string
  createdAt: string
}

export interface ApprovalLinePayload {
  name: string
  categoryId: number
  divisionId?: number | null
  departmentId?: number | null
  isActive?: boolean
}

export interface ApprovalLineStepPayload {
  step: number
  groupNo: number
  groupType: string
  approverType: string
  userId?: number | null
  jobLevelId?: number | null
  divisionId?: number | null
  jobPositionId?: number | null
  minApproval?: number
  isRequired?: boolean
  allowedActions?: string
  code?: string | null
}
