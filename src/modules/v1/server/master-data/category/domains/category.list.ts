import type { Category } from './category.entity'
import type { IPagination } from '@/src/shared/types/pagination'
import type { IAccess } from '@/src/shared/types/access'

export interface CategoryList {
  items: Category[]
  pagination: IPagination
  access: IAccess
}
