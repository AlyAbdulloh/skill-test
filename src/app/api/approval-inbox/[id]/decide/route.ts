import { NextRequest } from 'next/server'
import { ApprovalInboxUsecase } from '@/modules/v1/server/approval-inbox/usecases/approval-inbox.usecase'
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from '@/src/shared/utils/api-response'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    await ApprovalInboxUsecase.decide(Number(id), body)
    return apiSuccess(null, 'Keputusan approval disimpan')
  } catch (err: any) {
    if (err.message === 'Unauthorized') return apiUnauthorized()
    if (err.message === 'Forbidden') return apiForbidden()
    return apiError(err.message || 'Internal server error', 'E-000', 500)
  }
}
