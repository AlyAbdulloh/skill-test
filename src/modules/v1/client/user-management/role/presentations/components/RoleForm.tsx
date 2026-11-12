'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Role } from '../../domains/role.entity'

import { RoleRepository } from '../../repositories/role.repository'

interface RoleFormProps {
  role?: Role | null
  onClose: () => void
  onSaved: () => void
}

export function RoleForm({ role, onClose, onSaved }: RoleFormProps) {
  const [name, setName] = useState(role?.name || '')
  const [saving, setSaving] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { nameRef.current?.focus() }, [])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      if (role) {
        await RoleRepository.update(role.id, { name })
        toast.success('Role updated')
      } else {
        await RoleRepository.create({ name })
        toast.success('Role created')
      }
      onSaved()
    } catch {
      toast.error('Failed to save role')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg border border-slate-200">
        <h3 className="mb-5 text-lg font-bold text-slate-900">{role ? 'Edit Role' : 'New Role'}</h3>
        <div className="mb-5">
          <Label htmlFor="role-name" className="mb-1.5 block">Role Name *</Label>
          <Input id="role-name" ref={nameRef} value={name} onChange={e => setName(e.target.value)} required className="rounded-xl" placeholder="e.g. admin, editor, viewer" />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" size="lg" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button type="submit" size="lg" disabled={saving} className="rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white shadow-lg gap-2">
            {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : role ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  )
}
