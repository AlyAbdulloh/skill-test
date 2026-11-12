'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useSession } from 'next-auth/react'
import { useTitle } from '@/src/shared/contexts/TitleContext'
import { useApprovalLineTable } from './hooks/useApprovalLineTable'
import { ApprovalLineTable } from './components/ApprovalLineTable'
import { ApprovalLineForm } from './components/ApprovalLineForm'
import { ApprovalLineSteps } from './components/ApprovalLineSteps'
import type { ApprovalLine } from '../domains/approval-line.entity'

export function ApprovalLinePage() {
  const { data: session } = useSession()
  const { setTitle } = useTitle()
  const { pageData, loading, search, setSearch, page, setPage, fetchData, handleDelete, handleCreate, handleUpdate } = useApprovalLineTable()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ApprovalLine | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApprovalLine | null>(null)
  const [stepsTarget, setStepsTarget] = useState<ApprovalLine | null>(null)

  const canManage = session?.user?.permissions?.includes('configuration.approval-line.manage')

  useEffect(() => {
    setTitle('Approval Lines', 'Configure approval workflows per feature')
  }, [setTitle])

  function openNew() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(item: ApprovalLine) {
    setEditing(item)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (deleteTarget) {
      await handleDelete(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div />
        {canManage && (
          <Button onClick={openNew} className="rounded-lg bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white shadow-sm gap-2 cursor-pointer">
            <Plus size={16} /> New Approval Line
          </Button>
        )}
      </div>

      <ApprovalLineTable
        pageData={pageData}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        page={page}
        onPageChange={setPage}
        canManage={!!canManage}
        onEdit={openEdit}
        onDelete={item => setDeleteTarget(item)}
        onViewSteps={item => setStepsTarget(item)}
      />

      <ApprovalLineForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => { setFormOpen(false); fetchData() }}
        item={editing}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      <ApprovalLineSteps
        open={stepsTarget !== null}
        onClose={() => setStepsTarget(null)}
        workflow={stepsTarget}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Approval Line"
        message={`Delete "${deleteTarget?.name}"? This will also remove all its steps.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  )
}
