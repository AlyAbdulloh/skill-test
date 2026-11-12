'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Category } from '../../domains/category.entity'

import { CategoryRepository } from '../../repositories/category.repository'

interface CategoryFormProps {
  category?: Category | null
  onClose: () => void
  onSaved: () => void
}

export function CategoryForm({ category, onClose, onSaved }: CategoryFormProps) {
  const [code, setCode] = useState(category?.code || '')
  const [name, setName] = useState(category?.name || '')
  const [description, setDescription] = useState(category?.description || '')
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
      if (category) {
        await CategoryRepository.update(category.id, {
          code: code || undefined,
          name,
          description: description || undefined,
        })
        toast.success('Category updated')
      } else {
        await CategoryRepository.create({
          code: code || undefined,
          name,
          description: description || undefined,
        })
        toast.success('Category created')
      }
      onSaved()
    } catch {
      toast.error('Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg border border-slate-200">
        <h3 className="mb-5 text-lg font-bold text-slate-900">
          {category ? 'Edit Category' : 'New Category'}
        </h3>
        <div className="mb-4">
          <Label htmlFor="category-code" className="mb-1.5 block">Code</Label>
          <Input
            id="category-code"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
            placeholder="e.g. HR, FIN, OPS"
            className="rounded-xl"
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="category-name" className="mb-1.5 block">Name *</Label>
          <Input
            id="category-name"
            ref={nameRef}
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="rounded-xl"
          />
        </div>
        <div className="mb-5">
          <Label htmlFor="category-desc" className="mb-1.5 block">Description</Label>
          <Textarea
            id="category-desc"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="rounded-xl"
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" size="lg" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button type="submit" size="lg" disabled={saving} className="rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white shadow-lg gap-2">
            {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : category ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  )
}
