import { ApprovalInboxRepository } from '../repositories/approval-inbox.repository'

export const ApprovalInboxUsecase = {
  async list() {
    return ApprovalInboxRepository.getAll()
  },

  async decide(requestId: number, action: 'approve' | 'reject', note?: string) {
    return ApprovalInboxRepository.decide(requestId, action, note)
  },
}
