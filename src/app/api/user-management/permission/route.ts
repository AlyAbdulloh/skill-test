import { NextRequest } from 'next/server'
import { PermissionUsecase } from '@/modules/v1/server/user-management/permission/usecases/permission.usecase'
import { apiSuccess, apiError, apiUnauthorized } from '@/src/shared/utils/api-response'

export async function GET() {
  try {
    const result = await PermissionUsecase.list()
    return apiSuccess(result)
  } catch (err: any) {
    if (err.message === 'Unauthorized') return apiUnauthorized()
    return apiError(err.message || 'Internal server error', 'E-000', 500)
  }
}
