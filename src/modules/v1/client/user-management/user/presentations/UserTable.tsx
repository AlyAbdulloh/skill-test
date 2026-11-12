'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2, Search, Pencil, Trash2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useSession } from 'next-auth/react'
import { useTitle } from '@/src/shared/contexts/TitleContext'
import { Pagination } from '@/src/shared/partials/Pagination'
import { UserForm } from './components/UserForm'
import { AssignRoleModal } from './components/AssignRoleModal'
import type { User } from '../domains/user.entity'
import type { UserList } from '../domains/user.list'
import { UserRepository } from '../repositories/user.repository'

export function UserTable() {
  const { data: session } = useSession()
  const { setTitle } = useTitle()
  const [pageData, setPageData] = useState<UserList | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [roleTarget, setRoleTarget] = useState<User | null>(null)
  const canManage = session?.user?.permissions?.includes('user.manage')

  useEffect(() => {
    setTitle('Users', 'Manage system users and their roles')
  }, [setTitle])

  const fetchData = useCallback(async (q: string, p: number) => {
    setLoading(true)
    try {
      const data = await UserRepository.getAll(p, 20, q)
      setPageData(data)
    } catch {
      toast.error('Failed to load users')
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
      await UserRepository.softDelete(id)
      toast.success('User deleted')
      fetchData(debouncedSearch, page)
    } catch {
      toast.error('Failed to delete user')
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
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
            />
          </div>
          {canManage && (
            <Button onClick={() => { setEditing(null); setFormOpen(true) }} className="rounded-lg bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white shadow-sm gap-2 whitespace-nowrap cursor-pointer">
              <Plus size={16} /> New User
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            {search ? 'No users match your search' : 'No users yet.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-3 text-left font-medium text-slate-600">Name</th>
                    <th className="px-5 py-3 text-left font-medium text-slate-600">Username</th>
                    <th className="px-5 py-3 text-left font-medium text-slate-600">Email</th>
                    <th className="px-5 py-3 text-left font-medium text-slate-600">Roles</th>
                    <th className="px-5 py-3 text-left font-medium text-slate-600">Status</th>
                    {canManage && <th className="px-5 py-3 text-right font-medium text-slate-600">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map(user => (
                    <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-800">{user.name}</td>
                      <td className="px-5 py-3 text-slate-500">{user.username}</td>
                      <td className="px-5 py-3 text-slate-500">{user.email}</td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.roles?.map(role => (
                            <span key={role} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
                              <Shield size={10} /> {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${user.is_active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {canManage && (
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button onClick={() => setRoleTarget(user)} variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-50 h-8 w-8 p-0 cursor-pointer" title="Manage Roles">
                              <Shield size={14} />
                            </Button>
                            <Button onClick={() => { setEditing(user); setFormOpen(true) }} variant="ghost" size="sm" className="text-cyan-600 hover:bg-cyan-50 h-8 w-8 p-0 cursor-pointer">
                              <Pencil size={14} />
                            </Button>
                            <Button onClick={() => setDeleteTarget(user)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 h-8 w-8 p-0 cursor-pointer">
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
              total={pageData?.pagination?.total ?? 0}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {formOpen && (
        <UserForm user={editing} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); fetchData(debouncedSearch, page) }} />
      )}

      {roleTarget && (
        <AssignRoleModal user={roleTarget} onClose={() => setRoleTarget(null)} onSaved={() => { setRoleTarget(null); fetchData(debouncedSearch, page) }} />
      )}

      <ConfirmDialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget.id); return Promise.resolve() }}
        title="Delete User" message={`Delete user "${deleteTarget?.name}"?`} confirmLabel="Delete" variant="danger" />
    </>
  )
}
