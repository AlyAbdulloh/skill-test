import type { CategoryList } from '../domains/category.list'
import type { Category } from '../domains/category.entity'

export const CategoryRepository = {
  async getAll(page = 1, perPage = 20, keywords = ''): Promise<CategoryList> {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('per_page', String(perPage))
    if (keywords) params.set('keywords', keywords)

    const res = await fetch(`/api/master-data/category?${params.toString()}`)
    if (!res.ok) throw new Error('Gagal mengambil data kategori')
    const json = await res.json()
    return json.data ?? json
  },

  async getById(id: number): Promise<Category | null> {
    const res = await fetch(`/api/master-data/category/${id}`)
    if (!res.ok) throw new Error('Gagal mengambil detail kategori')
    const json = await res.json()
    return json.data ?? json
  },

  async create(data: { name: string; code?: string; description?: string }): Promise<Category> {
    const res = await fetch('/api/master-data/category', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Gagal membuat kategori')
    const json = await res.json()
    return json.data ?? json
  },

  async update(id: number, data: { name?: string; code?: string; description?: string; is_active?: boolean }) {
    const res = await fetch(`/api/master-data/category/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Gagal mengupdate kategori')
    const json = await res.json()
    return json.data ?? json
  },

  async softDelete(id: number) {
    const res = await fetch(`/api/master-data/category/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Gagal menghapus kategori')
    const json = await res.json()
    return json.data ?? json
  },
}
