import { auth } from '@/src/core/auth/auth'
import { CategoryRepository } from '../repositories/category.repository'
import { Loggers } from '@/src/shared/utils/logger'

const log = Loggers.category

export const CategoryUsecase = {
  async list(page = 1, perPage = 20, keywords = '') {
    const session = await auth()
    if (!session) {
      log.warn('list unauthorized')
      throw new Error('Unauthorized')
    }

    return CategoryRepository.getAll(page, perPage, keywords)
  },

  async create(data: { name: string; code?: string; description?: string }) {
    const session = await auth()
    if (!session?.user?.permissions?.includes('master-data.manage')) {
      log.warn('create forbidden', { user: session?.user?.name })
      throw new Error('Forbidden')
    }

    const result = await CategoryRepository.create(data)
    log.info('created category', { user: session.user.name, categoryId: result?.id, name: data.name })
    return result
  },

  async update(id: number, data: { name?: string; code?: string; description?: string; is_active?: boolean }) {
    const session = await auth()
    if (!session?.user?.permissions?.includes('master-data.manage')) {
      log.warn('update forbidden', { user: session?.user?.name, id })
      throw new Error('Forbidden')
    }

    const result = await CategoryRepository.update(id, data)
    log.info('updated category', { user: session.user.name, categoryId: id })
    return result
  },

  async delete(id: number) {
    const session = await auth()
    if (!session?.user?.permissions?.includes('master-data.manage')) {
      log.warn('delete forbidden', { user: session?.user?.name, id })
      throw new Error('Forbidden')
    }

    await CategoryRepository.softDelete(id)
    log.info('deleted category', { user: session.user.name, categoryId: id })
  },
}
