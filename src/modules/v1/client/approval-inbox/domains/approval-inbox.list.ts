import type { ApprovalInboxItem } from './approval-inbox.entity'
import type { IPagination } from '@/src/shared/types/pagination'
import type { IAccess } from '@/src/shared/types/access'

export interface ApprovalInboxList {
  items: ApprovalInboxItem[]
  pagination: IPagination
  access: IAccess
}
