export interface Permission {
  id: number
  name: string
  description?: string | null
  guard_name: string | null
  created_at: string
  updated_at: string
}
