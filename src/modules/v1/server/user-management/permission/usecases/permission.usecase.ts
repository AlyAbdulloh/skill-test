import { auth } from '@/src/core/auth/auth'
import { PermissionRepository } from '../repositories/permission.repository'
import { Loggers } from '@/src/shared/utils/logger'

const log = Loggers.permission

export const PermissionUsecase = {
  async list() {
    const session = await auth()
    if (!session) {
      log.warn('list unauthorized')
      throw new Error('Unauthorized')
    }
    return PermissionRepository.getAll()
  },
}
