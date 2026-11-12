import { RoleRepository } from '../repositories/role.repository'

export const RoleUsecase = {
  async list(page = 1, perPage = 20, keywords = '') {
    return RoleRepository.getAll(page, perPage, keywords)
  },

  async getById(id: number) {
    return RoleRepository.getById(id)
  },

  async create(data: { name: string; guard_name?: string }) {
    return RoleRepository.create(data)
  },

  async update(id: number, data: { name?: string }) {
    return RoleRepository.update(id, data)
  },

  async delete(id: number) {
    return RoleRepository.softDelete(id)
  },

  async getPermissions(roleId: number) {
    return RoleRepository.getRolePermissions(roleId)
  },

  async syncPermissions(roleId: number, permissionIds: number[]) {
    return RoleRepository.syncPermissions(roleId, permissionIds)
  },
}
