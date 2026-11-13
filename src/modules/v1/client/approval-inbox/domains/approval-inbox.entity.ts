export interface ApprovalInboxItem {
  id: number
  document_request_id: number
  approver_id: number
  document_title: string
  description: string | null
  category_name: string | null
  requester_name: string | null
  current_step: number | null
  total_steps: number | null
  created_at: string
}
