import type { User } from './user.entity'
import type { IPagination } from '@/src/shared/types/pagination'
import type { IAccess } from '@/src/shared/types/access'

export interface UserList {
  items: User[]
  pagination: IPagination
  access: IAccess
}
