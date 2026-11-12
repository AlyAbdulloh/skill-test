import { ApprovalLineRepository } from '../repositories/approval-line.repository'
import type { ApprovalLinePayload, ApprovalLineStepPayload } from '../domains/approval-line.entity'

export const ApprovalLineUsecase = {
  async list(page = 1, perPage = 20, keywords = '', featureId?: number) {
    return ApprovalLineRepository.getAll(page, perPage, keywords, featureId)
  },

  async detail(id: number) {
    return ApprovalLineRepository.getById(id)
  },

  async create(payload: ApprovalLinePayload) {
    return ApprovalLineRepository.create(payload)
  },

  async update(id: number, payload: Partial<ApprovalLinePayload>) {
    return ApprovalLineRepository.update(id, payload)
  },

  async delete(id: number) {
    return ApprovalLineRepository.delete(id)
  },

  async getSteps(workflowId: number) {
    return ApprovalLineRepository.getSteps(workflowId)
  },

  async syncSteps(workflowId: number, steps: ApprovalLineStepPayload[]) {
    return ApprovalLineRepository.syncSteps(workflowId, steps)
  },

  async getFeatures(keywords?: string) {
    return ApprovalLineRepository.getFeatures(keywords)
  },

  async getUsers(keywords?: string) {
    return ApprovalLineRepository.getUsers(keywords)
  },
}
