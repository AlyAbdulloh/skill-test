import { UserRepository } from '../repositories/user.repository'

export const UserUsecase = {
  async list(page = 1, perPage = 20, keywords = '') {
    return UserRepository.getAll(page, perPage, keywords)
  },

  async getById(id: number) {
    return UserRepository.getById(id)
  },

  async create(data: { username: string; email: string; name: string; password: string }) {
    return UserRepository.create(data)
  },

  async update(id: number, data: { username?: string; email?: string; name?: string; is_active?: boolean; password?: string }) {
    return UserRepository.update(id, data)
  },

  async delete(id: number) {
    return UserRepository.softDelete(id)
  },

  async assignRole(userId: number, roleId: number) {
    return UserRepository.assignRole(userId, roleId)
  },

  async revokeRole(userId: number, roleId: number) {
    return UserRepository.revokeRole(userId, roleId)
  },
}
