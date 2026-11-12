import type { ApprovalLine } from './approval-line.entity'
import type { IPagination } from '@/src/shared/types/pagination'

export interface ApprovalLineList {
  items: ApprovalLine[]
  pagination: IPagination
}
