import { ApprovalInboxUsecase } from '@/modules/v1/server/approval-inbox/usecases/approval-inbox.usecase'
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from '@/src/shared/utils/api-response'

export async function GET() {
  try {
    const result = await ApprovalInboxUsecase.list()
    return apiSuccess(result)
  } catch (err: any) {
    if (err.message === 'Unauthorized') return apiUnauthorized()
    if (err.message === 'Forbidden') return apiForbidden()
    return apiError(err.message || 'Internal server error', 'E-000', 500)
  }
}
