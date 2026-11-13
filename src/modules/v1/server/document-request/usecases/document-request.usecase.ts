import { z } from 'zod'
import { auth } from '@/src/core/auth/auth'
import { DocumentRequestRepository } from '../repositories/document-request.repository'
import { Loggers } from '@/src/shared/utils/logger'

const log = Loggers.document_request

const createSchema = z.object({
  title: z.string().trim().min(1, 'Title wajib diisi').max(255),
  description: z.string().trim().max(5000).optional(),
  categoryId: z.number().int().positive('Category wajib dipilih'),
  status: z.enum(['draft', 'pending']).optional(),
})

const updateSchema = z.object({
  title: z.string().trim().min(1, 'Title wajib diisi').max(255).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  categoryId: z.number().int().positive('Category wajib dipilih').optional(),
  status: z.enum(['draft', 'pending']).optional(),
})

export const DocumentRequestUsecase = {
  async list(page = 1, perPage = 20, keywords = '', categoryId?: number) {
    const session = await auth()
    if (!session) {
      log.warn('list unauthorized')
      throw new Error('Unauthorized')
    }
    if (!session.user.permissions.includes('document-request.view')) {
      log.warn('list forbidden', { user: session.user.name })
      throw new Error('Forbidden')
    }

    return DocumentRequestRepository.getAll(page, perPage, keywords, categoryId, Number(session.user.id))
  },

  async getById(id: number) {
    const session = await auth()
    if (!session) {
      log.warn('getById unauthorized', { id })
      throw new Error('Unauthorized')
    }
    if (!session.user.permissions.includes('document-request.view')) {
      log.warn('getById forbidden', { user: session.user.name, id })
      throw new Error('Forbidden')
    }

    return DocumentRequestRepository.getById(id)
  },

  async getDetail(id: number) {
    const session = await auth()
    if (!session) {
      log.warn('getDetail unauthorized', { id })
      throw new Error('Unauthorized')
    }
    if (!session.user.permissions.includes('document-request.view')) {
      log.warn('getDetail forbidden', { user: session.user.name, id })
      throw new Error('Forbidden')
    }

    return DocumentRequestRepository.getDetail(id)
  },

  async create(data: unknown) {
    const session = await auth()
    if (!session) {
      log.warn('create unauthorized')
      throw new Error('Unauthorized')
    }
    if (!session.user.permissions.includes('document-request.manage')) {
      log.warn('create forbidden', { user: session.user.name })
      throw new Error('Forbidden')
    }

    const parsed = createSchema.parse(data)
    const createdBy = session.user.id ? Number(session.user.id) : null
    const result = await DocumentRequestRepository.create({ ...parsed, createdBy })
    log.info('created document request', { user: session.user.name, requestId: result?.id, title: parsed.title })
    return result
  },

  async update(id: number, data: unknown) {
    const session = await auth()
    if (!session) {
      log.warn('update unauthorized', { id })
      throw new Error('Unauthorized')
    }
    if (!session.user.permissions.includes('document-request.manage')) {
      log.warn('update forbidden', { user: session.user.name, id })
      throw new Error('Forbidden')
    }

    const parsed = updateSchema.parse(data)

    const current = await DocumentRequestRepository.getById(id)
    if (current && current.status === 'approved') {
      throw new Error('Request sudah approved, tidak dapat diubah')
    }

    await DocumentRequestRepository.update(id, parsed)
    log.info('updated document request', { user: session.user.name, requestId: id })
  },

  async resubmit(id: number) {
    const session = await auth()
    if (!session) {
      log.warn('resubmit unauthorized', { id })
      throw new Error('Unauthorized')
    }
    if (!session.user.permissions.includes('document-request.resubmit')) {
      log.warn('resubmit forbidden', { user: session.user.name, id })
      throw new Error('Forbidden')
    }

    const requesterId = session.user.id ? Number(session.user.id) : null
    if (!requesterId) throw new Error('Unauthorized')

    const revisionNo = await DocumentRequestRepository.resubmit(id, requesterId)
    log.info('resubmitted document request', {
      user: session.user.name,
      requestId: id,
      revisionNo,
    })
    return revisionNo
  },

  async delete(id: number) {
    const session = await auth()
    if (!session) {
      log.warn('delete unauthorized', { id })
      throw new Error('Unauthorized')
    }
    if (!session.user.permissions.includes('document-request.manage')) {
      log.warn('delete forbidden', { user: session.user.name, id })
      throw new Error('Forbidden')
    }

    const current = await DocumentRequestRepository.getById(id)
    if (current && current.status === 'approved') {
      throw new Error('Request sudah approved, tidak dapat dihapus')
    }

    await DocumentRequestRepository.softDelete(id)
    log.info('deleted document request', { user: session.user.name, requestId: id })
  },
}
