import type { Permission } from '../domains/permission.entity'

export const PermissionRepository = {
  async getAll(): Promise<Permission[]> {
    const res = await fetch('/api/user-management/permission')
    if (!res.ok) throw new Error('Gagal mengambil data permission')
    const json = await res.json()
    return json.data ?? json
  },
}
