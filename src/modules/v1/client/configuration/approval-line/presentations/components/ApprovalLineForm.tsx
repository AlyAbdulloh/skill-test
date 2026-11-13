'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { SearchableSelect } from '@/components/ui/searchable-select'
import type { ApprovalLine } from '../../domains/approval-line.entity'
import type { Category } from '../../domains/category.entity'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  item?: ApprovalLine | null
  onCreate: (payload: Record<string, unknown>) => Promise<boolean>
  onUpdate: (id: number, payload: Record<string, unknown>) => Promise<boolean>
}

export function ApprovalLineForm({ open, onClose, onSaved, item, onCreate, onUpdate }: Props) {
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [saving, setSaving] = useState(false)

  const isEdit = !!item

  useEffect(() => {
    if (open) {
      if (item) {
        setName(item.name)
        setCategoryId(item.categoryId)
        setIsActive(item.isActive)
      } else {
        setName('')
        setCategoryId(null)
        setIsActive(true)
      }
    }
  }, [open, item])

  useEffect(() => {
    if (!open) return
    setLoadingCategories(true)
    fetch('/api/configuration/categories')
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : data.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingCategories(false))
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !categoryId) return

    setSaving(true)
    const payload = { name: name.trim(), categoryId, isActive }
    const ok = isEdit ? await onUpdate(item!.id, payload) : await onCreate(payload)
    if (ok) onSaved()
    setSaving(false)
  }

  const categoryOptions = categories.map(c => ({
    value: c.id,
    label: `${c.name} (${c.code})`,
  }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Approval Line' : 'New Approval Line'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Category Approval"
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 mt-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Category</label>
            <div className="mt-2">
              {loadingCategories ? (
                <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 size={14} className="animate-spin" /> Loading categories...</div>
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
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 cursor-pointer"
            />
            <label htmlFor="isActive" className="text-sm text-slate-700 cursor-pointer">Active</label>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">Cancel</Button>
            <Button type="submit" disabled={saving || !name.trim() || !categoryId} className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white cursor-pointer">
              {saving ? <><Loader2 size={14} className="animate-spin mr-2" /> Saving...</> : isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
