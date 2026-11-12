import { NextRequest } from 'next/server'
import { RoleUsecase } from '@/modules/v1/server/user-management/role/usecases/role.usecase'
import { apiSuccess, apiError, apiUnauthorized } from '@/src/shared/utils/api-response'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    await RoleUsecase.update(Number(id), body)
    return apiSuccess(null, 'Role updated')
  } catch (err: any) {
    if (err.message === 'Unauthorized') return apiUnauthorized()
    if (err.message === 'Forbidden') return apiError('Forbidden', 'E-GE403FB', 403)
    return apiError(err.message || 'Internal server error', 'E-000', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await RoleUsecase.delete(Number(id))
    return apiSuccess(null, 'Role deleted')
  } catch (err: any) {
    if (err.message === 'Unauthorized') return apiUnauthorized()
    if (err.message === 'Forbidden') return apiError('Forbidden', 'E-GE403FB', 403)
    return apiError(err.message || 'Internal server error', 'E-000', 500)
  }
}
