import { NextRequest } from 'next/server'
import { UserUsecase } from '@/modules/v1/server/user-management/user/usecases/user.usecase'
import { apiSuccess, apiError, apiUnauthorized } from '@/src/shared/utils/api-response'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { role_id } = await req.json()
    await UserUsecase.assignRole(Number(id), role_id)
    return apiSuccess(null, 'Role assigned')
  } catch (err: any) {
    if (err.message === 'Unauthorized') return apiUnauthorized()
    if (err.message === 'Forbidden') return apiError('Forbidden', 'E-GE403FB', 403)
    return apiError(err.message || 'Internal server error', 'E-000', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { role_id } = await req.json()
    await UserUsecase.revokeRole(Number(id), role_id)
    return apiSuccess(null, 'Role revoked')
  } catch (err: any) {
    if (err.message === 'Unauthorized') return apiUnauthorized()
    if (err.message === 'Forbidden') return apiError('Forbidden', 'E-GE403FB', 403)
    return apiError(err.message || 'Internal server error', 'E-000', 500)
  }
}
