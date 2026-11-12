export interface Role {
  id: number
  name: string
  guard_name: string | null
  is_system: boolean
  is_active: boolean
  description?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}
