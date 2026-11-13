import { NextRequest } from 'next/server'
import { DocumentRequestUsecase } from '@/modules/v1/server/document-request/usecases/document-request.usecase'
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from '@/src/shared/utils/api-response'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await DocumentRequestUsecase.getById(Number(id))
    if (!result) return apiError('Document request not found', 'E-NF404', 404)
    return apiSuccess(result)
  } catch (err: any) {
    if (err.message === 'Unauthorized') return apiUnauthorized()
    if (err.message === 'Forbidden') return apiForbidden()
    return apiError(err.message || 'Internal server error', 'E-000', 500)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    await DocumentRequestUsecase.update(Number(id), body)
    return apiSuccess(null, 'Document request updated')
  } catch (err: any) {
    if (err.message === 'Unauthorized') return apiUnauthorized()
    if (err.message === 'Forbidden') return apiForbidden()
    return apiError(err.message || 'Internal server error', 'E-000', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await DocumentRequestUsecase.delete(Number(id))
    return apiSuccess(null, 'Document request deleted')
  } catch (err: any) {
    if (err.message === 'Unauthorized') return apiUnauthorized()
    if (err.message === 'Forbidden') return apiForbidden()
    return apiError(err.message || 'Internal server error', 'E-000', 500)
  }
}
