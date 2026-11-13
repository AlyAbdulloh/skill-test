import { NextRequest } from 'next/server'
import { DocumentRequestUsecase } from '@/modules/v1/server/document-request/usecases/document-request.usecase'
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from '@/src/shared/utils/api-response'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await DocumentRequestUsecase.getDetail(Number(id))
    if (!result) return apiError('Document request not found', 'E-NF404', 404)
    return apiSuccess(result)
  } catch (err: any) {
    if (err.message === 'Unauthorized') return apiUnauthorized()
    if (err.message === 'Forbidden') return apiForbidden()
    return apiError(err.message || 'Internal server error', 'E-000', 500)
  }
}
