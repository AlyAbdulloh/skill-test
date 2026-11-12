import type { Role } from './role.entity'
import type { IPagination } from '@/src/shared/types/pagination'
import type { IAccess } from '@/src/shared/types/access'

export interface RoleList {
  items: Role[]
  pagination: IPagination
  access: IAccess
}
