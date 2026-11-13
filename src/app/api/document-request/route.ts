import { NextRequest } from 'next/server'
import { DocumentRequestUsecase } from '@/modules/v1/server/document-request/usecases/document-request.usecase'
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from '@/src/shared/utils/api-response'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const page = Number(searchParams.get('page')) || 1
    const perPage = Number(searchParams.get('per_page')) || 20
    const keywords = searchParams.get('keywords') || ''
    const categoryId = searchParams.get('category_id')
      ? Number(searchParams.get('category_id'))
      : undefined

    const result = await DocumentRequestUsecase.list(page, perPage, keywords, categoryId)
    return apiSuccess(result)
  } catch (err: any) {
    if (err.message === 'Unauthorized') return apiUnauthorized()
    if (err.message === 'Forbidden') return apiForbidden()
    return apiError(err.message || 'Internal server error', 'E-000', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await DocumentRequestUsecase.create(body)
    return apiSuccess(result, 'Document request created')
  } catch (err: any) {
    if (err.message === 'Unauthorized') return apiUnauthorized()
    if (err.message === 'Forbidden') return apiForbidden()
    return apiError(err.message || 'Internal server error', 'E-000', 500)
  }
}
