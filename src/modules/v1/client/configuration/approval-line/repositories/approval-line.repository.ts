import type { ApprovalLinePayload, ApprovalLineStepPayload } from '../domains/approval-line.entity'
import type { ApprovalLineList } from '../domains/approval-line.list'

export const ApprovalLineRepository = {
  async getAll(page = 1, perPage = 20, keywords = '', featureId?: number): Promise<ApprovalLineList> {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('per_page', String(perPage))
    if (keywords) params.set('keywords', keywords)
    if (featureId) params.set('feature_id', String(featureId))

    const res = await fetch(`/api/configuration/approval-line?${params.toString()}`)
    if (!res.ok) throw new Error('Gagal mengambil data approval line')
    const json = await res.json()
    return json.data ?? json
  },

  async getById(id: number) {
    const res = await fetch(`/api/configuration/approval-line/${id}`)
    if (!res.ok) throw new Error('Gagal mengambil detail approval line')
    const json = await res.json()
    return json.data ?? json
  },

  async create(payload: ApprovalLinePayload) {
    const res = await fetch('/api/configuration/approval-line', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Gagal membuat approval line')
    const json = await res.json()
    return json.data ?? json
  },

  async update(id: number, payload: Partial<ApprovalLinePayload>) {
    const res = await fetch(`/api/configuration/approval-line/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Gagal mengupdate approval line')
    const json = await res.json()
    return json.data ?? json
  },

  async delete(id: number) {
    const res = await fetch(`/api/configuration/approval-line/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Gagal menghapus approval line')
    const json = await res.json()
    return json.data ?? json
  },

  async getSteps(workflowId: number) {
    const res = await fetch(`/api/configuration/approval-line/${workflowId}/steps`)
    if (!res.ok) throw new Error('Gagal mengambil approval steps')
    const json = await res.json()
    return json.data ?? json
  },

  async syncSteps(workflowId: number, steps: ApprovalLineStepPayload[]) {
    const res = await fetch(`/api/configuration/approval-line/${workflowId}/steps`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steps }),
    })
    if (!res.ok) throw new Error('Gagal menyimpan approval steps')
    const json = await res.json()
    return json.data ?? json
  },

  async getFeatures(keywords = '') {
    const params = new URLSearchParams()
    if (keywords) params.set('keywords', keywords)
    const res = await fetch(`/api/configuration/features?${params.toString()}`)
    if (!res.ok) throw new Error('Gagal mengambil features')
    const json = await res.json()
    return json.data ?? json
  },

  async getUsers(keywords = '') {
    const params = new URLSearchParams()
    if (keywords) params.set('keywords', keywords)
    const res = await fetch(`/api/configuration/users?${params.toString()}`)
    if (!res.ok) throw new Error('Gagal mengambil users')
    const json = await res.json()
    return json.data ?? json
  },
}
