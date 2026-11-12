import type { RoleList } from '../domains/role.list'
import type { Role } from '../domains/role.entity'

export const RoleRepository = {
  async getAll(page = 1, perPage = 20, keywords = ''): Promise<RoleList> {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('per_page', String(perPage))
    if (keywords) params.set('keywords', keywords)

    const res = await fetch(`/api/user-management/role?${params.toString()}`)
    if (!res.ok) throw new Error('Gagal mengambil data role')
    const json = await res.json()
    return json.data ?? json
  },

  async getById(id: number): Promise<Role | null> {
    const res = await fetch(`/api/user-management/role/${id}`)
    if (!res.ok) throw new Error('Gagal mengambil detail role')
    const json = await res.json()
    return json.data ?? json
  },

  async create(data: { name: string; guard_name?: string }) {
    const res = await fetch('/api/user-management/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Gagal membuat role')
    const json = await res.json()
    return json.data ?? json
  },

  async update(id: number, data: { name?: string }) {
    const res = await fetch(`/api/user-management/role/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Gagal mengupdate role')
    const json = await res.json()
    return json.data ?? json
  },

  async softDelete(id: number) {
    const res = await fetch(`/api/user-management/role/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Gagal menghapus role')
    const json = await res.json()
    return json.data ?? json
  },

  async getRolePermissions(roleId: number) {
    const res = await fetch(`/api/user-management/role/${roleId}/permissions`)
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? json
  },

  async syncPermissions(roleId: number, permissionIds: number[]) {
    const res = await fetch(`/api/user-management/role/${roleId}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissionIds }),
    })
    if (!res.ok) throw new Error('Gagal menyinkronkan permissions')
    const json = await res.json()
    return json.data ?? json
  },
}
