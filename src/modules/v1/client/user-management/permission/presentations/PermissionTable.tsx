'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Loader2, KeyRound } from 'lucide-react'
import { useTitle } from '@/src/shared/contexts/TitleContext'
import type { Permission } from '../domains/permission.entity'

export function PermissionTable() {
  const { setTitle } = useTitle()
  const [items, setItems] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTitle('Permissions', 'System permissions (read-only)')
  }, [setTitle])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/user-management/permission')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setItems(data || [])
    } catch {
      toast.error('Failed to load permissions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100">
        <p className="text-sm text-slate-500">{items.length} permissions</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center text-slate-500">No permissions yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-left font-medium text-slate-600">Name</th>
                <th className="px-5 py-3 text-left font-medium text-slate-600">Description</th>
              </tr>
            </thead>
            <tbody>
              {items.map(perm => (
                <tr key={perm.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">
                    <div className="flex items-center gap-2">
                      <KeyRound size={14} className="text-purple-500" />
                      {perm.name}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{perm.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
