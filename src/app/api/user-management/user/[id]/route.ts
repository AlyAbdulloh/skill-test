import { NextRequest } from 'next/server'
import { UserUsecase } from '@/modules/v1/server/user-management/user/usecases/user.usecase'
import { apiSuccess, apiError, apiUnauthorized } from '@/src/shared/utils/api-response'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    await UserUsecase.update(Number(id), body)
    return apiSuccess(null, 'User updated')
  } catch (err: any) {
    if (err.message === 'Unauthorized') return apiUnauthorized()
    if (err.message === 'Forbidden') return apiError('Forbidden', 'E-GE403FB', 403)
    return apiError(err.message || 'Internal server error', 'E-000', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await UserUsecase.delete(Number(id))
    return apiSuccess(null, 'User deleted')
  } catch (err: any) {
    if (err.message === 'Unauthorized') return apiUnauthorized()
    if (err.message === 'Forbidden') return apiError('Forbidden', 'E-GE403FB', 403)
    return apiError(err.message || 'Internal server error', 'E-000', 500)
  }
}
