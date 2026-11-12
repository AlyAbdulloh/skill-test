export interface Category {
  id: number
  code: string | null
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
}
