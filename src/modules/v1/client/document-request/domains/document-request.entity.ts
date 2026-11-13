export interface DocumentRequest {
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
  approver_name: string | null
  approver_type: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}
