'use client'

import { useState, useEffect } from 'react'
import { Loader2, X, CheckCircle2, XCircle, SkipForward, RefreshCcw, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DocumentRequestDetail, DocumentRequestDetailStep, DocumentRequestDetailTimeline } from '../../domains/document-request.detail'
import { DocumentRequestRepository } from '../../repositories/document-request.repository'

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-500 border border-slate-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  approved: 'bg-green-50 text-green-700 border border-green-200',
  rejected: 'bg-red-50 text-red-600 border border-red-200',
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function stepStatusBadge(status: string) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.draft
  const icon =
    status === 'approved' ? <CheckCircle2 size={13} /> :
    status === 'rejected' ? <XCircle size={13} /> :
    status === 'skipped' ? <SkipForward size={13} /> :
    <User size={13} />
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${style}`}>
      {icon} {status}
    </span>
  )
}

const ACTION_LABEL: Record<string, string> = {
  approve: 'Approved',
  reject: 'Rejected',
  skipped: 'Skipped (self-approval)',
  resubmit: 'Resubmitted',
}

function timelineActionBadge(action: string) {
  const base = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize border'
  const styles: Record<string, string> = {
    approve: `${base} bg-green-50 text-green-700 border-green-200`,
    reject: `${base} bg-red-50 text-red-600 border-red-200`,
    skipped: `${base} bg-slate-100 text-slate-500 border-slate-200`,
    resubmit: `${base} bg-cyan-50 text-cyan-700 border-cyan-200`,
  }
  const icon =
    action === 'approve' ? <CheckCircle2 size={13} /> :
    action === 'reject' ? <XCircle size={13} /> :
    action === 'skipped' ? <SkipForward size={13} /> :
    <RefreshCcw size={13} />
  return (
    <span className={styles[action] ?? `${base} bg-slate-100 text-slate-500 border-slate-200`}>
      {icon} {ACTION_LABEL[action] ?? action}
    </span>
  )
}

interface DocumentRequestDetailModalProps {
  requestId: number
  onClose: () => void
}

export function DocumentRequestDetailModal({ requestId, onClose }: DocumentRequestDetailModalProps) {
  const [detail, setDetail] = useState<DocumentRequestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    DocumentRequestRepository.getDetail(requestId)
      .then(data => { if (active) setDetail(data) })
      .catch(() => { if (active) setError('Gagal memuat detail request') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [requestId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-lg border border-slate-200">
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Detail Request</h3>
            <p className="text-sm text-slate-400">Info request, posisi approval & timeline audit</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={16} />
          </Button>
        </div>

        <div className="px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-500">{error}</div>
          ) : detail ? (
            <div className="space-y-6">
              {/* Info request */}
              <section>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Info Request</h4>
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{detail.title}</div>
                      {detail.description && <div className="mt-1 text-sm text-slate-500">{detail.description}</div>}
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[detail.status] ?? STATUS_STYLES.draft}`}>
                      {detail.status}
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div className="flex justify-between gap-2"><dt className="text-slate-400">Kategori</dt><dd className="text-slate-700">{detail.category_name || '—'}</dd></div>
                    <div className="flex justify-between gap-2"><dt className="text-slate-400">Requester</dt><dd className="text-slate-700">{detail.requester_name || '—'}</dd></div>
                    <div className="flex justify-between gap-2"><dt className="text-slate-400">Revisi ke-</dt><dd className="text-slate-700">{detail.revision_no}</dd></div>
                    <div className="flex justify-between gap-2"><dt className="text-slate-400">Diajukan</dt><dd className="text-slate-700">{formatDate(detail.created_at)}</dd></div>
                    <div className="flex justify-between gap-2"><dt className="text-slate-400">Diperbarui</dt><dd className="text-slate-700">{formatDate(detail.updated_at)}</dd></div>
                  </dl>
                </div>
              </section>

              {/* Posisi approval */}
              <section>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Posisi Approval</h4>
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
                    <div>
                      <div className="text-xs text-slate-400">Step aktif</div>
                      <div className="text-lg font-bold text-slate-900">
                        {detail.current_step ? `${detail.current_step} / ${detail.total_steps}` : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Status approval</div>
                      <div className="mt-1">{stepStatusBadge(detail.approval_status ?? 'draft')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Approver berikutnya</div>
                      <div className="mt-0.5 text-slate-800 font-medium">
                        {detail.next_approver_name || '—'}
                        {detail.next_approver_type && (
                          <span className="ml-2 inline-flex items-center rounded bg-cyan-50 px-1.5 py-0.5 text-[11px] font-medium text-cyan-700 border border-cyan-200 capitalize">
                            {detail.next_approver_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rantai step */}
                  {detail.steps.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs font-medium text-slate-400 mb-2">Alur persetujuan</div>
                      <ol className="space-y-0">
                        {detail.steps.map((s: DocumentRequestDetailStep) => (
                          <li key={s.step_ordinal} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold border ${detail.current_step === s.step_ordinal ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-white text-slate-500 border-slate-200'}`}>
                                {s.step_ordinal}
                              </span>
                              {s.step_ordinal < (detail.total_steps ?? 0) && (
                                <span className="w-px flex-1 min-h-[24px] bg-slate-200" />
                              )}
                            </div>
                            <div className="pb-4">
                              <div className="text-sm font-medium text-slate-800">
                                {s.approver_name || `Approver #${s.approver_id}`}
                                {s.approver_type && (
                                  <span className="ml-2 inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 border border-slate-200 capitalize">
                                    {s.approver_type}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                                {stepStatusBadge(s.status)}
                                {s.approved_at && (
                                  <span className="text-xs text-slate-400">{formatDate(s.approved_at)}</span>
                                )}
                              </div>
                              {s.notes && <div className="mt-1 text-xs text-slate-400 italic">“{s.notes}”</div>}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </section>

              {/* Timeline audit */}
              <section>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Timeline Audit</h4>
                {detail.timeline.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                    Belum ada aktivitas approval
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <ol className="space-y-0">
                      {detail.timeline.map((t: DocumentRequestDetailTimeline, idx: number) => (
                        <li key={t.id} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-400" />
                            {idx < detail.timeline.length - 1 && (
                              <span className="w-px flex-1 min-h-[24px] bg-slate-200" />
                            )}
                          </div>
                          <div className="pb-4">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              {timelineActionBadge(t.action)}
                              <span className="text-xs text-slate-400">{formatDate(t.created_at)}</span>
                            </div>
                            <div className="mt-1 text-sm text-slate-600">
                              Step {t.step_ordinal} · {t.approver_name || 'Approver'}
                            </div>
                            {t.comment && (
                              <div className="mt-1 text-xs text-slate-500 italic bg-white rounded-lg border border-slate-100 px-3 py-1.5">“{t.comment}”</div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400">Data tidak ditemukan</div>
          )}
        </div>
      </div>
    </div>
  )
}
