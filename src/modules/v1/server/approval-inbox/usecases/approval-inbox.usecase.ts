import { z } from 'zod'
import { auth } from '@/src/core/auth/auth'
import { ApprovalInboxRepository } from '../repositories/approval-inbox.repository'
import { Loggers } from '@/src/shared/utils/logger'

const log = Loggers.document_request

const decideSchema = z.object({
  action: z.enum(['approve', 'reject']),
  note: z.string().trim().max(2000).optional(),
})

export const ApprovalInboxUsecase = {
  async list() {
    const session = await auth()
    if (!session) {
      log.warn('inbox list unauthorized')
      throw new Error('Unauthorized')
    }
    if (!session.user.permissions.includes('approval-inbox.view')) {
      log.warn('inbox list forbidden', { user: session.user.name })
      throw new Error('Forbidden')
    }

    return ApprovalInboxRepository.getInbox(Number(session.user.id))
  },

  async decide(requestId: number, data: unknown) {
    const session = await auth()
    if (!session) {
      log.warn('inbox decide unauthorized', { requestId })
      throw new Error('Unauthorized')
    }
    if (!session.user.permissions.includes('approval-inbox.manage')) {
      log.warn('inbox decide forbidden', { user: session.user.name, requestId })
      throw new Error('Forbidden')
    }

    const parsed = decideSchema.parse(data)
    await ApprovalInboxRepository.decide(
      requestId,
      Number(session.user.id),
      parsed.action,
      parsed.note,
    )
    log.info('inbox decided', {
      user: session.user.name,
      requestId,
      action: parsed.action,
    })
  },
}
