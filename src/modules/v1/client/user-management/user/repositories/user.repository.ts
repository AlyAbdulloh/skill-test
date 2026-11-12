import type { UserList } from '../domains/user.list'
import type { User } from '../domains/user.entity'

export const UserRepository = {
  async getAll(page = 1, perPage = 20, keywords = ''): Promise<UserList> {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('per_page', String(perPage))
    if (keywords) params.set('keywords', keywords)

    const res = await fetch(`/api/user-management/user?${params.toString()}`)
    if (!res.ok) throw new Error('Gagal mengambil data user')
    const json = await res.json()
    return json.data ?? json
  },

  async getById(id: number): Promise<User | null> {
    const res = await fetch(`/api/user-management/user/${id}`)
    if (!res.ok) throw new Error('Gagal mengambil detail user')
    const json = await res.json()
    return json.data ?? json
  },

  async create(data: { username: string; email: string; name: string; password: string }) {
    const res = await fetch('/api/user-management/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Gagal membuat user')
    const json = await res.json()
    return json.data ?? json
  },

  async update(id: number, data: { username?: string; email?: string; name?: string; is_active?: boolean; password?: string }) {
    const res = await fetch(`/api/user-management/user/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Gagal mengupdate user')
    const json = await res.json()
    return json.data ?? json
  },

  async softDelete(id: number) {
    const res = await fetch(`/api/user-management/user/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Gagal menghapus user')
    const json = await res.json()
    return json.data ?? json
  },

  async assignRole(userId: number, roleId: number) {
    const res = await fetch(`/api/user-management/user/${userId}/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role_id: roleId }),
    })
    if (!res.ok) throw new Error('Gagal assign role')
    const json = await res.json()
    return json.data ?? json
  },

  async revokeRole(userId: number, roleId: number) {
    const res = await fetch(`/api/user-management/user/${userId}/role`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role_id: roleId }),
    })
    if (!res.ok) throw new Error('Gagal revoke role')
    const json = await res.json()
    return json.data ?? json
  },
}
