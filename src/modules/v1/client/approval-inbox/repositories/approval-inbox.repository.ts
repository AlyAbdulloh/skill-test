import type { ApprovalInboxList } from '../domains/approval-inbox.list'
import type { ApprovalInboxItem } from '../domains/approval-inbox.entity'

export const ApprovalInboxRepository = {
  async getAll(): Promise<ApprovalInboxList> {
    const res = await fetch('/api/approval-inbox')
    if (!res.ok) throw new Error('Gagal mengambil inbox approval')
    const json = await res.json()
    return json.data ?? json
  },

  async decide(
    requestId: number,
    action: 'approve' | 'reject',
    note?: string,
  ): Promise<ApprovalInboxItem> {
    const res = await fetch(`/api/approval-inbox/${requestId}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, note }),
    })
    if (!res.ok) throw new Error('Gagal menyimpan keputusan approval')
    const json = await res.json()
    return json.data ?? json
  },
}
