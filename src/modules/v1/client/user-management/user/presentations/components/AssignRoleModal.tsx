'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, Shield, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { User } from '../../domains/user.entity'

interface AssignRoleModalProps {
  user: User
  onClose: () => void
  onSaved: () => void
}

import { RoleRepository } from '@/modules/v1/client/user-management/role/repositories/role.repository'
import { UserRepository } from '../../repositories/user.repository'

interface RoleOption {
  id: number
  name: string
}

export function AssignRoleModal({ user, onClose, onSaved }: AssignRoleModalProps) {
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadRoles() {
      try {
        const data = await RoleRepository.getAll(1, 100)
        setRoles(data.items || [])
      } catch {
        toast.error('Failed to load roles')
      } finally {
        setLoading(false)
      }
    }
    loadRoles()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function handleAssign() {
    if (!selectedRoleId) return
    setSaving(true)
    try {
      await UserRepository.assignRole(user.id, selectedRoleId)
      toast.success('Role assigned')
      onSaved()
    } catch {
      toast.error('Failed to assign role')
    } finally {
      setSaving(false)
    }
  }

  async function handleRevoke(roleName: string) {
    const role = roles.find(r => r.name === roleName)
    if (!role) return
    setSaving(true)
    try {
      await UserRepository.revokeRole(user.id, role.id)
      toast.success('Role revoked')
      onSaved()
    } catch {
      toast.error('Failed to revoke role')
    } finally {
      setSaving(false)
    }
  }

  const availableRoles = roles.filter(r => !user.roles?.includes(r.name))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg border border-slate-200">
        <h3 className="mb-1 text-lg font-bold text-slate-900">Manage Roles</h3>
        <p className="text-sm text-slate-500 mb-5">User: {user.name}</p>

        {/* Current roles */}
        <div className="mb-4">
          <label className="text-sm font-medium text-slate-700 mb-2 block">Current Roles</label>
          <div className="flex flex-wrap gap-2">
            {user.roles?.length ? user.roles.map(role => (
              <span key={role} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
                <Shield size={12} /> {role}
                <button onClick={() => handleRevoke(role)} className="hover:text-red-600" disabled={saving}>
                  <X size={12} />
                </button>
              </span>
            )) : (
              <span className="text-sm text-slate-400">No roles assigned</span>
            )}
          </div>
        </div>

        {/* Assign new role */}
        {availableRoles.length > 0 && (
          <div className="mb-5">
            <label className="text-sm font-medium text-slate-700 mb-2 block">Assign Role</label>
            <div className="flex gap-2">
              <select
                value={selectedRoleId ?? ''}
                onChange={e => setSelectedRoleId(Number(e.target.value) || null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              >
                <option value="">Select a role...</option>
                {availableRoles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <Button onClick={handleAssign} disabled={!selectedRoleId || saving} size="sm" className="rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 text-white">
                {saving ? <Loader2 size={14} className="animate-spin" /> : 'Assign'}
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Close</Button>
        </div>
      </div>
    </div>
  )
}
