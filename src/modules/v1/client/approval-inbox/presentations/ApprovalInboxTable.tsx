'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Loader2, Inbox, ListOrdered, Eye, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useTitle } from '@/src/shared/contexts/TitleContext'
import type { ApprovalInboxList } from '../domains/approval-inbox.list'
import type { ApprovalInboxItem } from '../domains/approval-inbox.entity'
import { ApprovalInboxUsecase } from '../usecases/approval-inbox.usecase'

export function ApprovalInboxTable() {
  const { setTitle } = useTitle()
  const [pageData, setPageData] = useState<ApprovalInboxList | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewTarget, setReviewTarget] = useState<ApprovalInboxItem | null>(null)
  const [note, setNote] = useState('')
  const [noteError, setNoteError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setTitle('Approval Inbox', 'Requests waiting for your approval')
  }, [setTitle])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await ApprovalInboxUsecase.list()
      setPageData(data)
    } catch {
      toast.error('Gagal memuat inbox approval')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function openReview(item: ApprovalInboxItem) {
    setNote('')
    setNoteError('')
    setReviewTarget(item)
  }

  async function handleDecide(action: 'approve' | 'reject') {
    if (!reviewTarget) return

    if (action === 'reject' && !note.trim()) {
      setNoteError('Keterangan wajib diisi saat menolak pengajuan')
      return
    }

    setSubmitting(true)
    try {
      await ApprovalInboxUsecase.decide(reviewTarget.document_request_id, action, note.trim() || undefined)
      toast.success(action === 'approve' ? 'Request disetujui' : 'Request ditolak')
      setReviewTarget(null)
      fetchData()
    } catch (e: any) {
      toast.error(e?.message || 'Gagal menyimpan keputusan')
    } finally {
      setSubmitting(false)
    }
  }

  const items = pageData?.items ?? []

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center text-white">
            <Inbox size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Approval Inbox</p>
            <p className="text-xs text-slate-500">Daftar pengajuan yang menunggu keputusan Anda</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Tidak ada pengajuan yang menunggu approval Anda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Dokumen</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Kategori</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Requester</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Step</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Tanggal</th>
                  <th className="px-5 py-3 text-right font-medium text-slate-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-medium text-slate-800">{item.document_title}</td>
                    <td className="px-5 py-3 text-slate-600">{item.category_name ?? '-'}</td>
                    <td className="px-5 py-3 text-slate-600">{item.requester_name ?? '-'}</td>
                    <td className="px-5 py-3">
                      {item.current_step != null && item.total_steps != null ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-0.5 text-xs font-semibold">
                          <ListOrdered size={12} />
                          Step {item.current_step} / {item.total_steps}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end">
                        <Button
                          onClick={() => openReview(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white text-xs px-3 py-2 cursor-pointer"
                        >
                          <Eye size={14} /> Review
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={!!reviewTarget} onOpenChange={(open) => { if (!open) { setReviewTarget(null); setNoteError('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Pengajuan</DialogTitle>
            <DialogDescription>
              Periksa detail pengajuan di bawah ini sebelum mengambil keputusan.
            </DialogDescription>
          </DialogHeader>

          {reviewTarget && (
            <>
              <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 text-sm">
                <div className="px-4 py-3">
                  <p className="text-xs text-slate-400 mb-0.5">Dokumen</p>
                  <p className="font-medium text-slate-800">{reviewTarget.document_title}</p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs text-slate-400 mb-0.5">Deskripsi</p>
                  <p className="text-slate-700">{reviewTarget.description || '-'}</p>
                </div>
                <div className="px-4 py-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Kategori</p>
                    <p className="text-slate-700">{reviewTarget.category_name ?? '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Requester</p>
                    <p className="text-slate-700">{reviewTarget.requester_name ?? '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Step</p>
                    <p className="text-slate-700">
                      {reviewTarget.current_step != null && reviewTarget.total_steps != null
                        ? `Step ${reviewTarget.current_step} / ${reviewTarget.total_steps}`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Tanggal Pengajuan</p>
                    <p className="text-slate-700">
                      {new Date(reviewTarget.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Catatan / Keterangan <span className="text-red-500">*</span>
                  <span className="text-slate-400 font-normal"> (wajib jika menolak)</span>
                </label>
                <textarea
                  value={note}
                  onChange={e => { setNote(e.target.value); if (noteError) setNoteError('') }}
                  rows={3}
                  placeholder="Tambahkan keterangan untuk keputusan Anda..."
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
                />
                {noteError && <p className="text-xs text-red-500">{noteError}</p>}
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => { setReviewTarget(null); setNoteError('') }}
              className="rounded-lg text-slate-600 cursor-pointer"
            >
              Batal
            </Button>
            <Button
              onClick={() => handleDecide('reject')}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <X size={15} /> Tolak
            </Button>
            <Button
              onClick={() => handleDecide('approve')}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white cursor-pointer"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              <Check size={15} /> Setujui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
