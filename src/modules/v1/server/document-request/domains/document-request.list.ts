import type { DocumentRequest } from './document-request.entity'
import type { IPagination } from '@/src/shared/types/pagination'
import type { IAccess } from '@/src/shared/types/access'

export interface DocumentRequestList {
  items: DocumentRequest[]
  pagination: IPagination
  access: IAccess
}
