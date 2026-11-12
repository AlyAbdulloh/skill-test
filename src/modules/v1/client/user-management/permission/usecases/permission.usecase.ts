import { PermissionRepository } from '../repositories/permission.repository'

export const PermissionUsecase = {
  async list() {
    return PermissionRepository.getAll()
  },
}
