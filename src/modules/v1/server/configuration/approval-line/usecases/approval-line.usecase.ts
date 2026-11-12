import { auth } from '@/src/core/auth/auth'
import { ApprovalLineRepository } from '../repositories/approval-line.repository'
import { apiUnauthorized, apiForbidden, apiSuccess, apiError } from '@/src/shared/utils/api-response'
import { Loggers } from '@/src/shared/utils/logger'
import type { ApprovalLinePayload, ApprovalLineStepPayload } from '../domains/approval-line.entity'

const log = Loggers.approval_line

export const ApprovalLineUsecase = {
  async list(page: number, perPage: number, keywords: string, featureId?: number) {
    const session = await auth()
    if (!session) return apiUnauthorized()
    if (!session.user.permissions.includes('configuration.approval-line.view')) {
      log.warn('list forbidden', { user: session.user.name })
      return apiForbidden()
    }

    const data = await ApprovalLineRepository.getAll(page, perPage, keywords, featureId)
    return apiSuccess(data)
  },

  async detail(id: number) {
    const session = await auth()
    if (!session) return apiUnauthorized()
    if (!session.user.permissions.includes('configuration.approval-line.view')) {
      log.warn('detail forbidden', { user: session.user.name, id })
      return apiForbidden()
    }

    const data = await ApprovalLineRepository.getById(id)
    if (!data) return apiError('Not found', 'E-GE404', 404)
    return apiSuccess(data)
  },

  async create(payload: ApprovalLinePayload) {
    const session = await auth()
    if (!session) return apiUnauthorized()
    if (!session.user.permissions.includes('configuration.approval-line.manage')) {
      log.warn('create forbidden', { user: session.user.name })
      return apiForbidden()
    }

    const result = await ApprovalLineRepository.create(payload)
    log.info('created approval-line', { user: session.user.name, id: result.id, name: payload.name })
    return apiSuccess({ id: result.id }, 'Created')
  },

  async update(id: number, payload: Partial<ApprovalLinePayload>) {
    const session = await auth()
    if (!session) return apiUnauthorized()
    if (!session.user.permissions.includes('configuration.approval-line.manage')) {
      log.warn('update forbidden', { user: session.user.name, id })
      return apiForbidden()
    }

    await ApprovalLineRepository.update(id, payload)
    log.info('updated approval-line', { user: session.user.name, id })
    return apiSuccess(null, 'Updated')
  },

  async delete(id: number) {
    const session = await auth()
    if (!session) return apiUnauthorized()
    if (!session.user.permissions.includes('configuration.approval-line.manage')) {
      log.warn('delete forbidden', { user: session.user.name, id })
      return apiForbidden()
    }

    await ApprovalLineRepository.delete(id)
    log.info('deleted approval-line', { user: session.user.name, id })
    return apiSuccess(null, 'Deleted')
  },

  async getSteps(workflowId: number) {
    const session = await auth()
    if (!session) return apiUnauthorized()
    if (!session.user.permissions.includes('configuration.approval-line.view')) {
      log.warn('getSteps forbidden', { user: session.user.name, workflowId })
      return apiForbidden()
    }

    const data = await ApprovalLineRepository.getSteps(workflowId)
    return apiSuccess(data)
  },

  async syncSteps(workflowId: number, steps: ApprovalLineStepPayload[]) {
    const session = await auth()
    if (!session) return apiUnauthorized()
    if (!session.user.permissions.includes('configuration.approval-line.manage')) {
      log.warn('syncSteps forbidden', { user: session.user.name, workflowId })
      return apiForbidden()
    }

    await ApprovalLineRepository.syncSteps(workflowId, steps)
    log.info('synced approval-line steps', { user: session.user.name, workflowId, stepsCount: steps.length })
    return apiSuccess(null, 'Steps saved')
  },

  async getFeatures(keywords?: string) {
    const session = await auth()
    if (!session) return apiUnauthorized()

    const data = await ApprovalLineRepository.getSubmoduleFeatures(keywords)
    return apiSuccess(data)
  },

  async getUsers(keywords?: string) {
    const session = await auth()
    if (!session) return apiUnauthorized()

    const data = await ApprovalLineRepository.getUsers(keywords)
    return apiSuccess(data)
  },
}
