import { auth } from '@/src/core/auth/auth'
import { RoleRepository } from '../repositories/role.repository'
import { Loggers } from '@/src/shared/utils/logger'

const log = Loggers.role

export const RoleUsecase = {
  async list(page = 1, perPage = 20, keywords = '') {
    const session = await auth()
    if (!session) {
      log.warn('list unauthorized')
      throw new Error('Unauthorized')
    }
    return RoleRepository.getAll(page, perPage, keywords)
  },

  async getById(id: number) {
    const session = await auth()
    if (!session) {
      log.warn('getById unauthorized')
      throw new Error('Unauthorized')
    }
    return RoleRepository.getById(id)
  },

  async create(data: { name: string; guard_name?: string }) {
    const session = await auth()
    if (!session?.user?.permissions?.includes('role.manage')) {
      log.warn('create forbidden', { user: session?.user?.name })
      throw new Error('Forbidden')
    }
    const result = await RoleRepository.create(data)
    log.info('created role', { user: session.user.name, roleId: result?.id, name: data.name })
    return result
  },

  async update(id: number, data: { name?: string }) {
    const session = await auth()
    if (!session?.user?.permissions?.includes('role.manage')) {
      log.warn('update forbidden', { user: session?.user?.name, id })
      throw new Error('Forbidden')
    }
    const result = await RoleRepository.update(id, data)
    log.info('updated role', { user: session.user.name, roleId: id })
    return result
  },

  async delete(id: number) {
    const session = await auth()
    if (!session?.user?.permissions?.includes('role.manage')) {
      log.warn('delete forbidden', { user: session?.user?.name, id })
      throw new Error('Forbidden')
    }
    await RoleRepository.softDelete(id)
    log.info('deleted role', { user: session.user.name, roleId: id })
  },

  async getPermissions(roleId: number) {
    const session = await auth()
    if (!session) {
      log.warn('getPermissions unauthorized')
      throw new Error('Unauthorized')
    }
    return RoleRepository.getRolePermissions(roleId)
  },

  async syncPermissions(roleId: number, permissionIds: number[]) {
    const session = await auth()
    if (!session?.user?.permissions?.includes('role.manage')) {
      log.warn('syncPermissions forbidden', { user: session?.user?.name, roleId })
      throw new Error('Forbidden')
    }
    await RoleRepository.syncPermissions(roleId, permissionIds)
    log.info('synced permissions', { user: session.user.name, roleId, count: permissionIds.length })
  },
}
