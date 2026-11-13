export interface DocumentRequestDetailStep {
  step_ordinal: number
  approver_id: number
  approver_name: string | null
  approver_type: string | null
  status: string
  notes: string | null
  approved_at: string | null
}

export interface DocumentRequestDetailTimeline {
  id: number
  step_ordinal: number
  approver_name: string | null
  action: string
  comment: string | null
  created_at: string
}

export interface DocumentRequestDetail {
  id: number
  title: string
  description: string | null
  category_id: number
  category_name: string | null
  created_by: number | null
  requester_name: string | null
  status: string
  revision_no: number
  current_step: number | null
  total_steps: number | null
  approval_status: string | null
  next_approver_name: string | null
  next_approver_type: string | null
  steps: DocumentRequestDetailStep[]
  timeline: DocumentRequestDetailTimeline[]
  created_at: string
  updated_at: string
}
