import { DocumentRequestRepository } from '../repositories/document-request.repository'

export const DocumentRequestUsecase = {
  async list(page = 1, perPage = 20, keywords = '', categoryId?: number) {
    return DocumentRequestRepository.getAll(page, perPage, keywords, categoryId)
  },

  async getById(id: number) {
    return DocumentRequestRepository.getById(id)
  },

  async create(data: { title: string; description?: string; categoryId: number }) {
    return DocumentRequestRepository.create(data)
  },

  async getDetail(id: number) {
    return DocumentRequestRepository.getDetail(id)
  },

  async update(id: number, data: { title?: string; description?: string; categoryId?: number; status?: string }) {
    return DocumentRequestRepository.update(id, data)
  },

  async resubmit(id: number) {
    return DocumentRequestRepository.resubmit(id)
  },

  async delete(id: number) {
    return DocumentRequestRepository.softDelete(id)
  },
}
