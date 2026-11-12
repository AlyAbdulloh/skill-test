import { CategoryRepository } from '../repositories/category.repository'

export const CategoryUsecase = {
  async list(page = 1, perPage = 20, keywords = '') {
    return CategoryRepository.getAll(page, perPage, keywords)
  },

  async getById(id: number) {
    return CategoryRepository.getById(id)
  },

  async create(data: { name: string; code?: string; description?: string }) {
    return CategoryRepository.create(data)
  },

  async update(id: number, data: { name?: string; code?: string; description?: string; is_active?: boolean }) {
    return CategoryRepository.update(id, data)
  },

  async delete(id: number) {
    return CategoryRepository.softDelete(id)
  },
}
