import type { DocumentRequestList } from '../domains/document-request.list'
import type { DocumentRequest } from '../domains/document-request.entity'
import type { DocumentRequestDetail } from '../domains/document-request.detail'

export const DocumentRequestRepository = {
  async getAll(page = 1, perPage = 20, keywords = '', categoryId?: number): Promise<DocumentRequestList> {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('per_page', String(perPage))
    if (keywords) params.set('keywords', keywords)
    if (categoryId) params.set('category_id', String(categoryId))

    const res = await fetch(`/api/document-request?${params.toString()}`)
    if (!res.ok) throw new Error('Gagal mengambil data pengajuan dokumen')
    const json = await res.json()
    return json.data ?? json
  },

  async getById(id: number): Promise<DocumentRequest | null> {
    const res = await fetch(`/api/document-request/${id}`)
    if (!res.ok) throw new Error('Gagal mengambil detail pengajuan dokumen')
    const json = await res.json()
    return json.data ?? json
  },

  async getDetail(id: number): Promise<DocumentRequestDetail | null> {
    const res = await fetch(`/api/document-request/${id}/detail`)
    if (!res.ok) throw new Error('Gagal mengambil detail pengajuan dokumen')
    const json = await res.json()
    return json.data ?? json
  },

  async create(data: { title: string; description?: string; categoryId: number }): Promise<DocumentRequest> {
    const res = await fetch('/api/document-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Gagal membuat pengajuan dokumen')
    const json = await res.json()
    return json.data ?? json
  },

  async update(id: number, data: { title?: string; description?: string; categoryId?: number; status?: string }) {
    const res = await fetch(`/api/document-request/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Gagal mengupdate pengajuan dokumen')
    const json = await res.json()
    return json.data ?? json
  },

  async resubmit(id: number): Promise<{ revisionNo: number }> {
    const res = await fetch(`/api/document-request/${id}/resubmit`, {
      method: 'POST',
    })
    if (!res.ok) throw new Error('Gagal mengirim revisi')
    const json = await res.json()
    return json.data ?? json
  },

  async softDelete(id: number) {
    const res = await fetch(`/api/document-request/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Gagal menghapus pengajuan dokumen')
    const json = await res.json()
    return json.data ?? json
  },
}
