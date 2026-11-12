'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, Trash2, ChevronDown, ChevronRight, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { useApprovalSteps } from '../hooks/useApprovalSteps'
import type { ApprovalLine, ApprovalLineStep } from '../../domains/approval-line.entity'

interface Props {
  open: boolean
  onClose: () => void
  workflow: ApprovalLine | null
}

interface UserOption {
  id: number
  name: string
  username: string
}

const APPROVER_TYPES = [
  { value: 'user', label: 'User' },
  { value: 'job_level', label: 'Job Level' },
  { value: 'division', label: 'Division' },
  { value: 'job_position', label: 'Job Position' },
]

const GROUP_TYPES = [
  { value: 'SEQUENTIAL', label: 'Sequential' },
  { value: 'PARALLEL', label: 'Parallel' },
]

export function ApprovalLineSteps({ open, onClose, workflow }: Props) {
  const { groups, loading, saving, fetchSteps, addGroup, removeGroup, updateGroupType, addStep, removeStep, updateStep, saveSteps } = useApprovalSteps()
  const [addGroupOpen, setAddGroupOpen] = useState(false)
  const [newGroupType, setNewGroupType] = useState('SEQUENTIAL')
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())
  const [users, setUsers] = useState<UserOption[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (open && workflow) {
      fetchSteps(workflow.id)
      setExpandedGroups(new Set([0]))
    }
  }, [open, workflow, fetchSteps])

  useEffect(() => {
    if (!open) return
    setLoadingUsers(true)
    fetch('/api/configuration/users')
      .then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data : data.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingUsers(false))
  }, [open])

  function toggleGroup(index: number) {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function handleAddGroup() {
    addGroup(newGroupType)
    setExpandedGroups(prev => new Set([...prev, groups.length]))
    setAddGroupOpen(false)
  }

  async function handleSave() {
    await saveSteps()
  }

  const userOptions = users.map(u => ({ value: u.id, label: `${u.name} (${u.username})` }))

  let globalStepNum = 0

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle>Approval Steps</SheetTitle>
            <SheetDescription>{workflow?.name ?? ''}</SheetDescription>
          </SheetHeader>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {groups.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">No groups yet. Add a group to start defining steps.</p>
              )}

              {groups.map((group, gi) => {
                const isExpanded = expandedGroups.has(gi)
                return (
                  <div key={gi} className="border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleGroup(gi)}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">Group {gi + 1}</span>
                      <span className="text-xs text-slate-500">{group.steps.length} step{group.steps.length !== 1 ? 's' : ''}</span>
                      <span className="text-xs text-slate-400 ml-auto">{group.groupType}</span>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); removeGroup(gi) }}
                        className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </button>

                    {isExpanded && (
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <label className="text-xs font-medium text-slate-500">Group Type</label>
                          <SearchableSelect
                            options={GROUP_TYPES}
                            value={group.groupType}
                            onChange={v => updateGroupType(gi, String(v))}
                            placeholder="Type"
                            clearable={false}
                            className="w-[160px]"
                          />
                        </div>

                        {group.steps.map((step, si) => {
                          globalStepNum++
                          const currentStepNum = globalStepNum
                          return (
                            <div key={si} className="border border-slate-200 rounded-lg p-3 space-y-3">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-white bg-cyan-500 w-6 h-6 rounded-full flex items-center justify-center">{currentStepNum}</span>
                                <div className="flex-1">
                                  <SearchableSelect
                                    options={APPROVER_TYPES}
                                    value={step.approverType}
                                    onChange={v => {
                                      updateStep(gi, si, {
                                        approverType: String(v),
                                        userId: null,
                                        jobLevelId: null,
                                        divisionId: null,
                                        jobPositionId: null,
                                      })
                                    }}
                                    placeholder="Approver type"
                                    clearable={false}
                                    className="w-full"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeStep(gi, si)}
                                  className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              {step.approverType === 'user' && (
                                <div>
                                  <label className="text-xs font-medium text-slate-500 mb-1 block">User</label>
                                  {loadingUsers ? (
                                    <div className="flex items-center gap-2 text-xs text-slate-400"><Loader2 size={12} className="animate-spin" /> Loading users...</div>
                                  ) : (
                                    <SearchableSelect
                                      options={userOptions}
                                      value={step.userId ?? null}
                                      onChange={v => updateStep(gi, si, { userId: typeof v === 'number' ? v : null })}
                                      placeholder="Select user..."
                                      searchPlaceholder="Search users..."
                                    />
                                  )}
                                </div>
                              )}

                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="text-xs font-medium text-slate-500 mb-1 block">Min Approval</label>
                                  <input
                                    type="number"
                                    min={1}
                                    value={step.minApproval ?? 1}
                                    onChange={e => updateStep(gi, si, { minApproval: parseInt(e.target.value) || 1 })}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-slate-500 mb-1 block">Allowed Actions</label>
                                  <input
                                    type="text"
                                    value={step.allowedActions ?? 'approve,reject'}
                                    onChange={e => updateStep(gi, si, { allowedActions: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                  />
                                </div>
                                <div className="flex items-end">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={step.isRequired ?? true}
                                      onChange={e => updateStep(gi, si, { isRequired: e.target.checked })}
                                      className="w-4 h-4 rounded border-slate-300"
                                    />
                                    <span className="text-xs text-slate-600">Required</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          )
                        })}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addStep(gi)}
                          className="w-full gap-2 text-slate-500 cursor-pointer"
                        >
                          <Plus size={14} /> Add Step
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddGroupOpen(true)}
                  className="gap-2 cursor-pointer"
                >
                  <Plus size={16} /> Add Group
                </Button>
                <div className="flex-1" />
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white gap-2 cursor-pointer"
                >
                  {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Steps</>}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={addGroupOpen} onOpenChange={setAddGroupOpen}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle>Add Group</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Group Type</label>
            <SearchableSelect
              options={GROUP_TYPES}
              value={newGroupType}
              onChange={v => setNewGroupType(String(v))}
              placeholder="Select type"
              clearable={false}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddGroupOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={handleAddGroup} className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white cursor-pointer">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
