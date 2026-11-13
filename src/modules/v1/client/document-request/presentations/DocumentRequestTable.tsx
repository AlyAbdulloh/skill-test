'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2, Search, Pencil, Trash2, ListOrdered, RefreshCcw, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useSession } from 'next-auth/react'
import { useTitle } from '@/src/shared/contexts/TitleContext'
import { Pagination } from '@/src/shared/partials/Pagination'
import { DocumentRequestForm } from './components/DocumentRequestForm'
import { DocumentRequestDetailModal } from './components/DocumentRequestDetailModal'
import type { DocumentRequest } from '../domains/document-request.entity'
import type { DocumentRequestList } from '../domains/document-request.list'
import { DocumentRequestRepository } from '../repositories/document-request.repository'

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-500 border border-slate-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  approved: 'bg-green-50 text-green-700 border border-green-200',
  rejected: 'bg-red-50 text-red-600 border border-red-200',
}

export function DocumentRequestTable() {
  const { data: session } = useSession()
  const { setTitle } = useTitle()
  const [pageData, setPageData] = useState<DocumentRequestList | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<DocumentRequest | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DocumentRequest | null>(null)
  const [detailTarget, setDetailTarget] = useState<DocumentRequest | null>(null)
  const canManage = session?.user?.permissions?.includes('document-request.manage')
  const canResubmit = session?.user?.permissions?.includes('document-request.resubmit')
  const showActions = canManage || canResubmit

  useEffect(() => {
    setTitle('Document Requests', 'Manage document submissions')
  }, [setTitle])

  const fetchData = useCallback(async (q: string, p: number) => {
    setLoading(true)
    try {
      const data = await DocumentRequestRepository.getAll(p, 20, q)
      setPageData(data)
    } catch {
      toast.error('Failed to load document requests')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData(debouncedSearch, page) }, [fetchData, debouncedSearch, page])

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 300)
    return () => clearTimeout(timer)
  }, [search])

  function openNew() { setEditing(null); setFormOpen(true) }
  function openEdit(req: DocumentRequest) { setEditing(req); setFormOpen(true) }

  async function handleResubmit(id: number) {
    try {
      await DocumentRequestRepository.resubmit(id)
      toast.success('Revisi dikirim ulang ke approval')
      fetchData(debouncedSearch, page)
    } catch {
      toast.error('Gagal mengirim revisi')
    }
  }

  async function handleDelete(id: number) {
    try {
      await DocumentRequestRepository.softDelete(id)
      toast.success('Document request deleted')
      fetchData(debouncedSearch, page)
    } catch {
      toast.error('Failed to delete document request')
    }
    setDeleteTarget(null)
  }

  const items = pageData?.items ?? []
  const pagination = pageData?.pagination
  const totalPages = pagination?.total_pages ?? 1

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-5 py-4 flex flex-col lg:flex-row gap-3 justify-between items-center border-b border-slate-100">
          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search document requests..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
            />
          </div>
          {canManage && (
            <Button onClick={openNew} className="rounded-lg bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white shadow-sm gap-2 whitespace-nowrap cursor-pointer">
              <Plus size={16} /> New Request
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            {search ? 'No document requests match your search' : 'No document requests yet.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-3 text-left font-medium text-slate-600">Title</th>
                    <th className="px-5 py-3 text-left font-medium text-slate-600">Category</th>
                    <th className="px-5 py-3 text-left font-medium text-slate-600">Requester</th>
                    <th className="px-5 py-3 text-left font-medium text-slate-600">Status</th>
                    <th className="px-5 py-3 text-left font-medium text-slate-600">Step</th>
                    <th className="px-5 py-3 text-left font-medium text-slate-600">Date</th>
                    {showActions && <th className="px-5 py-3 text-right font-medium text-slate-600">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map(req => (
                    <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-800">{req.title}</div>
                        {req.description && (
                          <div className="text-xs text-slate-400 truncate max-w-[240px]">{req.description}</div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center rounded-lg bg-cyan-50 px-2 py-0.5 text-xs font-semibold text-cyan-700 border border-cyan-200">
                          {req.category_name || '-'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{req.requester_name || '-'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[req.status] ?? STATUS_STYLES.draft}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {req.approver_name ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
                              <ListOrdered size={13} className="text-cyan-500" />
                              {req.approver_name}
                            </span>
                            {req.approver_type && (
                              <span className="inline-flex w-fit items-center rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 border border-slate-200 capitalize">
                                {req.approver_type}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {req.created_at ? new Date(req.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      {showActions && (
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button onClick={() => setDetailTarget(req)} variant="ghost" size="sm" className="text-slate-500 hover:text-cyan-700 hover:bg-cyan-50 h-8 w-8 p-0 cursor-pointer" title="Detail request">
                              <Eye size={14} />
                            </Button>
                            {canResubmit && req.status === 'rejected' && (
                              <Button
                                onClick={() => handleResubmit(req.id)}
                                variant="ghost"
                                size="sm"
                                className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 h-8 gap-1 px-2 text-xs cursor-pointer"
                              >
                                <RefreshCcw size={13} /> Revisi
                              </Button>
                            )}
                            {req.status !== 'approved' && (
                              <>
                                <Button onClick={() => openEdit(req)} variant="ghost" size="sm" className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 h-8 w-8 p-0 cursor-pointer">
                                  <Pencil size={14} />
                                </Button>
                                <Button onClick={() => setDeleteTarget(req)} variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0 cursor-pointer">
                                  <Trash2 size={14} />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              total={pagination?.total ?? 0}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {formOpen && (
        <DocumentRequestForm
          request={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); fetchData(debouncedSearch, page) }}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget.id); return Promise.resolve() }}
        title="Delete Document Request"
        message={`Delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

      {detailTarget && (
        <DocumentRequestDetailModal
          requestId={detailTarget.id}
          onClose={() => setDetailTarget(null)}
        />
      )}
    </>
  )
}
