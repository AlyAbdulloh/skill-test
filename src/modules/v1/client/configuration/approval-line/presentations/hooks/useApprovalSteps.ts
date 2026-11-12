'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { ApprovalLineStep, ApprovalLineStepPayload } from '../../domains/approval-line.entity'
import { ApprovalLineRepository } from '../../repositories/approval-line.repository'

interface StepGroup {
  groupNo: number
  groupType: string
  steps: ApprovalLineStep[]
}

export function useApprovalSteps() {
  const [groups, setGroups] = useState<StepGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [workflowId, setWorkflowId] = useState<number | null>(null)

  const fetchSteps = useCallback(async (wfId: number) => {
    setLoading(true)
    setWorkflowId(wfId)
    try {
      const data = await ApprovalLineRepository.getSteps(wfId)
      const steps: ApprovalLineStep[] = Array.isArray(data) ? data : data.data ?? []

      const groupMap = new Map<number, ApprovalLineStep[]>()
      for (const step of steps) {
        const gNo = step.groupNo ?? 1
        if (!groupMap.has(gNo)) groupMap.set(gNo, [])
        groupMap.get(gNo)!.push(step)
      }

      const gs: StepGroup[] = Array.from(groupMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([groupNo, groupSteps]) => ({
          groupNo,
          groupType: groupSteps[0]?.groupType ?? 'SEQUENTIAL',
          steps: groupSteps.sort((a, b) => a.step - b.step),
        }))

      setGroups(gs)
    } catch {
      toast.error('Failed to load steps')
    } finally {
      setLoading(false)
    }
  }, [])

  function addGroup(groupType: string) {
    setGroups(prev => [
      ...prev,
      {
        groupNo: prev.length + 1,
        groupType,
        steps: [],
      },
    ])
  }

  function removeGroup(groupIndex: number) {
    setGroups(prev => prev.filter((_, i) => i !== groupIndex).map((g, i) => ({ ...g, groupNo: i + 1 })))
  }

  function updateGroupType(groupIndex: number, groupType: string) {
    setGroups(prev => prev.map((g, i) => i === groupIndex ? { ...g, groupType } : g))
  }

  function addStep(groupIndex: number) {
    setGroups(prev => prev.map((g, i) => {
      if (i !== groupIndex) return g
      const newStep: ApprovalLineStep = {
        id: 0,
        workflowId: workflowId ?? 0,
        step: 0,
        groupNo: g.groupNo,
        groupType: g.groupType,
        approverType: 'user',
        minApproval: 1,
        isRequired: true,
        allowedActions: 'approve,reject',
        createdAt: '',
      }
      return { ...g, steps: [...g.steps, newStep] }
    }))
  }

  function removeStep(groupIndex: number, stepIndex: number) {
    setGroups(prev => prev.map((g, i) => {
      if (i !== groupIndex) return g
      return { ...g, steps: g.steps.filter((_, si) => si !== stepIndex) }
    }))
  }

  function updateStep(groupIndex: number, stepIndex: number, patch: Partial<ApprovalLineStep>) {
    setGroups(prev => prev.map((g, i) => {
      if (i !== groupIndex) return g
      return {
        ...g,
        steps: g.steps.map((s, si) => si === stepIndex ? { ...s, ...patch } : s),
      }
    }))
  }

  async function saveSteps() {
    if (!workflowId) return false
    setSaving(true)
    try {
      const flatSteps: ApprovalLineStepPayload[] = []
      let stepNum = 1
      for (const g of groups) {
        for (const s of g.steps) {
          flatSteps.push({
            step: stepNum++,
            groupNo: g.groupNo,
            groupType: g.groupType,
            approverType: s.approverType,
            userId: s.userId,
            jobLevelId: s.jobLevelId,
            divisionId: s.divisionId,
            jobPositionId: s.jobPositionId,
            minApproval: s.minApproval,
            isRequired: s.isRequired,
            allowedActions: s.allowedActions,
            code: s.code,
          })
        }
      }

      await ApprovalLineRepository.syncSteps(workflowId, flatSteps)
      toast.success('Steps saved')
      await fetchSteps(workflowId)
      return true
    } catch {
      toast.error('Failed to save steps')
      return false
    } finally {
      setSaving(false)
    }
  }

  return {
    groups,
    loading,
    saving,
    workflowId,
    fetchSteps,
    addGroup,
    removeGroup,
    updateGroupType,
    addStep,
    removeStep,
    updateStep,
    saveSteps,
  }
}
