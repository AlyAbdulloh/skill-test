'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { SearchableSelect } from '@/components/ui/searchable-select'
import type { ApprovalLine } from '../../domains/approval-line.entity'
import type { Feature } from '../../domains/feature.entity'

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
  const [featureId, setFeatureId] = useState<number | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [features, setFeatures] = useState<Feature[]>([])
  const [loadingFeatures, setLoadingFeatures] = useState(false)
  const [saving, setSaving] = useState(false)

  const isEdit = !!item

  useEffect(() => {
    if (open) {
      if (item) {
        setName(item.name)
        setFeatureId(item.featureId)
        setIsActive(item.isActive)
      } else {
        setName('')
        setFeatureId(null)
        setIsActive(true)
      }
    }
  }, [open, item])

  useEffect(() => {
    if (!open) return
    setLoadingFeatures(true)
    fetch('/api/configuration/features')
      .then(r => r.json())
      .then(data => setFeatures(Array.isArray(data) ? data : data.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingFeatures(false))
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !featureId) return

    setSaving(true)
    const payload = { name: name.trim(), featureId, isActive }
    const ok = isEdit ? await onUpdate(item!.id, payload) : await onCreate(payload)
    if (ok) onSaved()
    setSaving(false)
  }

  const featureOptions = features.map(f => ({
    value: f.id,
    label: `${f.name} (${f.routePath})`,
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
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Feature</label>
            <div className="mt-2">
              {loadingFeatures ? (
                <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 size={14} className="animate-spin" /> Loading features...</div>
              ) : (
                <SearchableSelect
                  options={featureOptions}
                  value={featureId}
                  onChange={v => setFeatureId(typeof v === 'number' ? v : null)}
                  placeholder="Select feature..."
                  searchPlaceholder="Search features..."
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
            <Button type="submit" disabled={saving || !name.trim() || !featureId} className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white cursor-pointer">
              {saving ? <><Loader2 size={14} className="animate-spin mr-2" /> Saving...</> : isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
