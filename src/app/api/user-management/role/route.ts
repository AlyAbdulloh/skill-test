import { NextRequest } from 'next/server'
import { RoleUsecase } from '@/modules/v1/server/user-management/role/usecases/role.usecase'
import { apiSuccess, apiError, apiUnauthorized } from '@/src/shared/utils/api-response'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const page = Number(searchParams.get('page')) || 1
    const perPage = Number(searchParams.get('per_page')) || 20
    const keywords = searchParams.get('keywords') || ''
    const result = await RoleUsecase.list(page, perPage, keywords)
    return apiSuccess(result)
  } catch (err: any) {
    if (err.message === 'Unauthorized') return apiUnauthorized()
    return apiError(err.message || 'Internal server error', 'E-000', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await RoleUsecase.create(body)
    return apiSuccess(result, 'Role created')
  } catch (err: any) {
    if (err.message === 'Unauthorized') return apiUnauthorized()
    if (err.message === 'Forbidden') return apiError('Forbidden', 'E-GE403FB', 403)
    return apiError(err.message || 'Internal server error', 'E-000', 500)
  }
}
