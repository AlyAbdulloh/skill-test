'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { User } from '../../domains/user.entity'

import { UserRepository } from '../../repositories/user.repository'

interface UserFormProps {
  user?: User | null
  onClose: () => void
  onSaved: () => void
}

export function UserForm({ user, onClose, onSaved }: UserFormProps) {
  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [name, setName] = useState(user?.name || '')
  const [password, setPassword] = useState('')
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
      const body: Record<string, any> = { username, email, name }
      if (password) body.password = password

      if (user) {
        await UserRepository.update(user.id, body)
        toast.success('User updated')
      } else {
        await UserRepository.create({ username, email, name, password })
        toast.success('User created')
      }
      onSaved()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save user')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg border border-slate-200">
        <h3 className="mb-5 text-lg font-bold text-slate-900">{user ? 'Edit User' : 'New User'}</h3>
        <div className="mb-4">
          <Label htmlFor="user-name" className="mb-1.5 block">Name *</Label>
          <Input id="user-name" ref={nameRef} value={name} onChange={e => setName(e.target.value)} required className="rounded-xl" />
        </div>
        <div className="mb-4">
          <Label htmlFor="user-username" className="mb-1.5 block">Username *</Label>
          <Input id="user-username" value={username} onChange={e => setUsername(e.target.value)} required className="rounded-xl" />
        </div>
        <div className="mb-4">
          <Label htmlFor="user-email" className="mb-1.5 block">Email *</Label>
          <Input id="user-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="rounded-xl" />
        </div>
        <div className="mb-5">
          <Label htmlFor="user-password" className="mb-1.5 block">Password {user ? '(leave blank to keep)' : '*'}</Label>
          <Input id="user-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required={!user} className="rounded-xl" />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" size="lg" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button type="submit" size="lg" disabled={saving} className="rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white shadow-lg gap-2">
            {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : user ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  )
}
