'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2, Search, Pencil, Trash2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useSession } from 'next-auth/react'
import { useTitle } from '@/src/shared/contexts/TitleContext'
import { Pagination } from '@/src/shared/partials/Pagination'
import { RoleForm } from './components/RoleForm'
import type { Role } from '../domains/role.entity'
import type { RoleList } from '../domains/role.list'
import { RoleRepository } from '../repositories/role.repository'

export function RoleTable() {
  const { data: session } = useSession()
  const { setTitle } = useTitle()
  const [pageData, setPageData] = useState<RoleList | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
  const canManage = session?.user?.permissions?.includes('role.manage')

  useEffect(() => {
    setTitle('Roles', 'Manage system roles and their permissions')
  }, [setTitle])

  const fetchData = useCallback(async (q: string, p: number) => {
    setLoading(true)
    try {
      const data = await RoleRepository.getAll(p, 20, q)
      setPageData(data)
    } catch {
      toast.error('Failed to load roles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData(debouncedSearch, page) }, [fetchData, debouncedSearch, page])

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 300)
    return () => clearTimeout(timer)
  }, [search])

  async function handleDelete(id: number) {
    try {
      await RoleRepository.softDelete(id)
      toast.success('Role deleted')
      fetchData(debouncedSearch, page)
    } catch {
      toast.error('Failed to delete role')
    }
    setDeleteTarget(null)
  }

  const items = pageData?.items ?? []
  const totalPages = pageData?.pagination?.total_pages ?? 1

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-5 py-4 flex flex-col lg:flex-row gap-3 justify-between items-center border-b border-slate-100">
          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search roles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
            />
          </div>
          {canManage && (
            <Button onClick={() => { setEditing(null); setFormOpen(true) }} className="rounded-lg bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white shadow-sm gap-2 whitespace-nowrap cursor-pointer">
              <Plus size={16} /> New Role
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            {search ? 'No roles match your search' : 'No roles yet.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-3 text-left font-medium text-slate-600">Name</th>
                    <th className="px-5 py-3 text-left font-medium text-slate-600">Description</th>
                    <th className="px-5 py-3 text-left font-medium text-slate-600">Status</th>
                    {canManage && <th className="px-5 py-3 text-right font-medium text-slate-600">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map(role => (
                    <tr key={role.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          <Shield size={14} className="text-cyan-500" />
                          {role.name}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{role.description || '-'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${role.is_active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                          {role.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {canManage && (
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button onClick={() => { setEditing(role); setFormOpen(true) }} variant="ghost" size="sm" className="text-cyan-600 hover:bg-cyan-50 h-8 w-8 p-0 cursor-pointer">
                              <Pencil size={14} />
                            </Button>
                            {!role.is_system && (
                              <Button onClick={() => setDeleteTarget(role)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 h-8 w-8 p-0 cursor-pointer">
                                <Trash2 size={14} />
                              </Button>
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
              total={pageData?.pagination?.total ?? 0}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {formOpen && (
        <RoleForm role={editing} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); fetchData(debouncedSearch, page) }} />
      )}

      <ConfirmDialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget.id); return Promise.resolve() }}
        title="Delete Role" message={`Delete role "${deleteTarget?.name}"?`} confirmLabel="Delete" variant="danger" />
    </>
  )
}
