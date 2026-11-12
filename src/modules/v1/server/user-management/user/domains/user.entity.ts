export interface User {
  id: number
  username: string
  email: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
  roles?: string[]
}
