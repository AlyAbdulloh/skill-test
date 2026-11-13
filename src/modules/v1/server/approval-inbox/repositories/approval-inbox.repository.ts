import { db, schema } from '@/src/core/db'
import { and, eq, desc, inArray, isNull } from 'drizzle-orm'
import type { ApprovalInboxList } from '../domains/approval-inbox.list'

const {
  approvalInbox,
  trsDocumentRequests,
  mstCategories,
  mstUsers,
  approvalInstances,
  approvalInstanceSteps,
  approvalSteps,
  approvalLogs,
} = schema

export const ApprovalInboxRepository = {
  async getInbox(approverId: number): Promise<ApprovalInboxList> {
    const rows = await db.select({
      id: approvalInbox.id,
      documentRequestId: approvalInbox.documentRequestId,
      approverId: approvalInbox.approverId,
      title: trsDocumentRequests.title,
      description: trsDocumentRequests.description,
      categoryName: mstCategories.name,
      requesterName: mstUsers.name,
      createdAt: approvalInbox.createdAt,
    })
      .from(approvalInbox)
      .innerJoin(trsDocumentRequests, eq(approvalInbox.documentRequestId, trsDocumentRequests.id))
      .leftJoin(mstCategories, eq(trsDocumentRequests.categoryId, mstCategories.id))
      .leftJoin(mstUsers, eq(trsDocumentRequests.createdBy, mstUsers.id))
      .where(and(
        eq(approvalInbox.approverId, approverId),
        isNull(trsDocumentRequests.deletedAt),
      ))
      .orderBy(desc(approvalInbox.createdAt))

    const requestIds = rows.map(r => Number(r.documentRequestId))
    const alwaysMap = new Map<number, { current_step: number | null; total_steps: number }>()

    if (requestIds.length) {
      const instances = await db.select().from(approvalInstances)
        .where(and(
          eq(approvalInstances.modelType, 'document_request'),
          inArray(approvalInstances.modelId, requestIds.map(String)),
        ))

      const instanceIds = instances.map(i => i.id)
      if (instanceIds.length) {
        const stepRows = await db.select({
          instanceId: approvalInstanceSteps.instanceId,
          stepOrdinal: approvalSteps.step,
        })
          .from(approvalInstanceSteps)
          .innerJoin(approvalSteps, eq(approvalInstanceSteps.stepId, approvalSteps.id))
          .where(inArray(approvalInstanceSteps.instanceId, instanceIds))

        const totalByInstance = new Map<number, number>()
        for (const s of stepRows) {
          const iid = Number((s as any).instanceId)
          totalByInstance.set(iid, (totalByInstance.get(iid) ?? 0) + 1)
        }

        for (const inst of instances) {
          const iid = Number(inst.id)
          alwaysMap.set(Number(inst.modelId), {
            current_step: inst.currentStep != null ? Number(inst.currentStep) : null,
            total_steps: totalByInstance.get(iid) ?? 0,
          })
        }
      }
    }

    return {
      items: rows.map(r => {
        const info = alwaysMap.get(Number(r.documentRequestId)) ?? { current_step: null, total_steps: 0 }
        return {
          id: Number(r.id),
          document_request_id: Number(r.documentRequestId),
          approver_id: Number(r.approverId),
          document_title: r.title,
          description: r.description ?? null,
          category_name: r.categoryName ?? null,
          requester_name: r.requesterName ?? null,
          current_step: info.current_step,
          total_steps: info.total_steps,
          created_at: r.createdAt ? new Date(r.createdAt).toISOString() : '',
        }
      }),
      pagination: {
        page: 1,
        per_page: rows.length,
        total: rows.length,
        total_pages: 1,
      },
      access: { can_view: true, can_update: true },
    }
  },

  async decide(requestId: number, approverId: number, action: 'approve' | 'reject', note?: string) {
    return db.transaction(async tx => {
      const instance = await tx.query.approvalInstances.findFirst({
        where: and(
          eq(approvalInstances.modelType, 'document_request'),
          eq(approvalInstances.modelId, String(requestId)),
        ),
      })
      if (!instance) throw new Error('Approval instance tidak ditemukan')

      // Self-approval guard: requester tidak boleh approve pengajuannya sendiri
      const doc = await tx.query.trsDocumentRequests.findFirst({
        where: eq(trsDocumentRequests.id, requestId),
      })
      if (doc && doc.createdBy != null && Number(doc.createdBy) === approverId) {
        throw new Error('Anda tidak dapat menyetujui pengajuan Anda sendiri')
      }

      // Guard final: request yang sudah approved/rejected tidak boleh lagi
      // menerima aksi approve/reject.
      if (doc && (doc.status === 'approved' || doc.status === 'rejected')) {
        throw new Error('Request sudah final, tidak dapat diproses kembali')
      }

      const stepRows = await tx.select({
        stepId: approvalInstanceSteps.id,
        approverUserId: approvalInstanceSteps.approverUserId,
        status: approvalInstanceSteps.status,
        stepOrdinal: approvalSteps.step,
      })
        .from(approvalInstanceSteps)
        .innerJoin(approvalSteps, eq(approvalInstanceSteps.stepId, approvalSteps.id))
        .where(eq(approvalInstanceSteps.instanceId, instance.id))
        .orderBy(approvalSteps.step)

      const targetIndex = stepRows.findIndex(s =>
        Number((s as any).approverUserId) === approverId &&
        (s as any).status === 'pending'
      )
      if (targetIndex === -1) {
        throw new Error('Anda bukan approver aktif untuk request ini')
      }

      // Guard urutan step: hanya approver pada step aktif (sesuai currentStep)
      // yang boleh melakukan aksi. Approver step berikutnya belum boleh bertindak
      // sebelum gilirannya tiba.
      const targetStep = stepRows[targetIndex]
      if (instance.currentStep == null || Number((targetStep as any).stepOrdinal) !== Number(instance.currentStep)) {
        throw new Error('Anda belum dapat melakukan aksi karena belum giliran Anda')
      }

      if (action === 'approve') {
        await tx.update(approvalInstanceSteps).set({
          status: 'approved',
          approvedAt: new Date(),
          notes: note || null,
        }).where(eq(approvalInstanceSteps.id, Number(targetStep.stepId)))

        await this.logAction(tx, Number(targetStep.stepId), 'approve', note)

        // Lanjut ke step berikutnya yang masih pending (lewati step yang
        // sudah otomatis dilewati / skipped karena self-approval)
        const nextPendingIdx = stepRows.findIndex((r, i) => i > targetIndex && (r as any).status === 'pending')
        if (nextPendingIdx !== -1) {
          const nextStep = stepRows[nextPendingIdx]
          // Masih ada step berikutnya → tetap pending, pindah ke approver berikutnya
          await this.updateInstance(tx, instance.id, {
            currentStep: Number((nextStep as any).stepOrdinal),
            status: 'pending',
          })
          await this.setInboxApprover(tx, requestId, Number((nextStep as any).approverUserId))
        } else {
          // Step terakhir → approval selesai
          await this.updateInstance(tx, instance.id, { status: 'approved' })
          await this.updateDocumentStatus(tx, requestId, 'approved')
          await this.removeInbox(tx, requestId)
        }
      } else {
        // Reject → tidak menambahkan data inbox
        await tx.update(approvalInstanceSteps).set({
          status: 'rejected',
          notes: note || null,
        }).where(eq(approvalInstanceSteps.id, Number(targetStep.stepId)))

        await this.logAction(tx, Number(targetStep.stepId), 'reject', note)

        await this.updateInstance(tx, instance.id, { status: 'rejected' })
        await this.updateDocumentStatus(tx, requestId, 'rejected')
        await this.removeInbox(tx, requestId)
      }
    })
  },

  async updateInstance(tx: any, instanceId: number, patch: Record<string, unknown>) {
    await tx.update(approvalInstances).set(patch).where(eq(approvalInstances.id, instanceId))
  },

  async updateDocumentStatus(tx: any, requestId: number, status: string) {
    await tx.update(trsDocumentRequests).set({ status }).where(eq(trsDocumentRequests.id, requestId))
  },

  async logAction(tx: any, instanceStepId: number, action: string, comment?: string) {
    await tx.insert(approvalLogs).values({
      instanceStepId,
      action,
      comment: comment || null,
    })
  },

  async setInboxApprover(tx: any, requestId: number, approverUserId: number) {
    await tx.delete(approvalInbox).where(eq(approvalInbox.documentRequestId, requestId))
    await tx.insert(approvalInbox).values({
      documentRequestId: requestId,
      approverId: approverUserId,
    })
  },

  async removeInbox(tx: any, requestId: number) {
    await tx.delete(approvalInbox).where(eq(approvalInbox.documentRequestId, requestId))
  },
}
