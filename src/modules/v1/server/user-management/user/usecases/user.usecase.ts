import { auth } from '@/src/core/auth/auth'
import { UserRepository } from '../repositories/user.repository'
import { Loggers } from '@/src/shared/utils/logger'

const log = Loggers.user

export const UserUsecase = {
  async list(page = 1, perPage = 20, keywords = '') {
    const session = await auth()
    if (!session) {
      log.warn('list unauthorized')
      throw new Error('Unauthorized')
    }
    return UserRepository.getAll(page, perPage, keywords)
  },

  async getById(id: number) {
    const session = await auth()
    if (!session) {
      log.warn('getById unauthorized')
      throw new Error('Unauthorized')
    }
    return UserRepository.getById(id)
  },

  async create(data: { username: string; email: string; name: string; password: string }) {
    const session = await auth()
    if (!session?.user?.permissions?.includes('user.manage')) {
      log.warn('create forbidden', { user: session?.user?.name })
      throw new Error('Forbidden')
    }
    const result = await UserRepository.create(data)
    log.info('created user', { user: session.user.name, userId: result?.id, username: data.username })
    return result
  },

  async update(id: number, data: { username?: string; email?: string; name?: string; is_active?: boolean; password?: string }) {
    const session = await auth()
    if (!session?.user?.permissions?.includes('user.manage')) {
      log.warn('update forbidden', { user: session?.user?.name, id })
      throw new Error('Forbidden')
    }
    const result = await UserRepository.update(id, data)
    log.info('updated user', { user: session.user.name, userId: id })
    return result
  },

  async delete(id: number) {
    const session = await auth()
    if (!session?.user?.permissions?.includes('user.manage')) {
      log.warn('delete forbidden', { user: session?.user?.name, id })
      throw new Error('Forbidden')
    }
    await UserRepository.softDelete(id)
    log.info('deleted user', { user: session.user.name, userId: id })
  },

  async assignRole(userId: number, roleId: number) {
    const session = await auth()
    if (!session?.user?.permissions?.includes('user.manage')) {
      log.warn('assignRole forbidden', { user: session?.user?.name, userId, roleId })
      throw new Error('Forbidden')
    }
    await UserRepository.assignRole(userId, roleId)
    log.info('assigned role', { user: session.user.name, userId, roleId })
  },

  async revokeRole(userId: number, roleId: number) {
    const session = await auth()
    if (!session?.user?.permissions?.includes('user.manage')) {
      log.warn('revokeRole forbidden', { user: session?.user?.name, userId, roleId })
      throw new Error('Forbidden')
    }
    await UserRepository.revokeRole(userId, roleId)
    log.info('revoked role', { user: session.user.name, userId, roleId })
  },
}
