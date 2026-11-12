'use client'

import { Loader2, Pencil, Trash2, ListOrdered, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/src/shared/partials/Pagination'
import type { ApprovalLine } from '../../domains/approval-line.entity'
import type { ApprovalLineList } from '../../domains/approval-line.list'

interface Props {
  pageData: ApprovalLineList | null
  loading: boolean
  search: string
  onSearchChange: (q: string) => void
  page: number
  onPageChange: (p: number) => void
  canManage: boolean
  onEdit: (item: ApprovalLine) => void
  onDelete: (item: ApprovalLine) => void
  onViewSteps: (item: ApprovalLine) => void
}

export function ApprovalLineTable({
  pageData,
  loading,
  search,
  onSearchChange,
  page,
  onPageChange,
  canManage,
  onEdit,
  onDelete,
  onViewSteps,
}: Props) {
  const items = pageData?.items ?? []
  const pagination = pageData?.pagination
  const totalPages = pagination?.total_pages ?? 1

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search approval lines..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-4 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          {search ? 'No approval lines match your search' : 'No approval lines yet.'}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Name</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Feature</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Steps</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Status</th>
                  {canManage && <th className="px-5 py-3 text-right font-medium text-slate-600">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800">{item.name}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {item.featureName && (
                        <span className="inline-flex items-center rounded-lg bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
                          {item.featureName}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => onViewSteps(item)}
                        className="flex items-center gap-1.5 text-cyan-600 hover:text-cyan-700 transition-colors cursor-pointer"
                      >
                        <ListOrdered size={14} />
                        <span className="text-sm font-medium">{item.stepsCount ?? 0} steps</span>
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${item.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button onClick={() => onEdit(item)} variant="ghost" size="sm" className="text-cyan-600 hover:bg-cyan-50 h-8 w-8 p-0 cursor-pointer">
                            <Pencil size={14} />
                          </Button>
                          <Button onClick={() => onDelete(item)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 h-8 w-8 p-0 cursor-pointer">
                            <Trash2 size={14} />
                          </Button>
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
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  )
}
