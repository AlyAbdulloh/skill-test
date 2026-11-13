'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SearchableSelect } from '@/components/ui/searchable-select'
import type { DocumentRequest } from '../../domains/document-request.entity'
import { DocumentRequestRepository } from '../../repositories/document-request.repository'

interface CategoryOption {
  id: number
  name: string
}

interface DocumentRequestFormProps {
  request?: DocumentRequest | null
  onClose: () => void
  onSaved: () => void
}

export function DocumentRequestForm({ request, onClose, onSaved }: DocumentRequestFormProps) {
  const [title, setTitle] = useState(request?.title || '')
  const [description, setDescription] = useState(request?.description || '')
  const [categoryId, setCategoryId] = useState<number | null>(request?.category_id ?? null)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [saving, setSaving] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => { titleRef.current?.focus() }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    setLoadingCategories(true)
    fetch('/api/master-data/category')
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : data.data?.items ?? data.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingCategories(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !categoryId) return

    setSaving(true)

    try {
      if (request) {
        await DocumentRequestRepository.update(request.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          categoryId,
        })
        toast.success('Document request updated')
      } else {
        await DocumentRequestRepository.create({
          title: title.trim(),
          description: description.trim() || undefined,
          categoryId,
        })
        toast.success('Document request created')
      }
      onSaved()
    } catch {
      toast.error('Failed to save document request')
    } finally {
      setSaving(false)
    }
  }

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg border border-slate-200">
        <h3 className="mb-5 text-lg font-bold text-slate-900">
          {request ? 'Edit Document Request' : 'New Document Request'}
        </h3>

        <div className="mb-4">
          <Label htmlFor="dr-title" className="mb-1.5 block">Title *</Label>
          <Input
            id="dr-title"
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. SOP Pengajuan Cuti"
            required
            className="rounded-xl"
          />
        </div>

        <div className="mb-4">
          <Label className="mb-1.5 block">Category *</Label>
          {loadingCategories ? (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 size={14} className="animate-spin" /> Loading categories...
            </div>
          ) : (
            <SearchableSelect
              options={categoryOptions}
              value={categoryId}
              onChange={v => setCategoryId(typeof v === 'number' ? v : null)}
              placeholder="Select category..."
              searchPlaceholder="Search categories..."
              clearable={false}
            />
          )}
        </div>

        <div className="mb-5">
          <Label htmlFor="dr-desc" className="mb-1.5 block">Description</Label>
          <Textarea
            id="dr-desc"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            placeholder="Deskripsikan dokumen yang diajukan..."
            className="rounded-xl"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" size="lg" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button type="submit" size="lg" disabled={saving || !title.trim() || !categoryId} className="rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white shadow-lg gap-2">
            {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : request ? 'Update' : 'Submit'}
          </Button>
        </div>
      </form>
    </div>
  )
}
