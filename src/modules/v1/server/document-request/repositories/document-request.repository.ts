import { db, schema } from '@/src/core/db'
import { and, eq, desc, asc, isNull, count, like, or, inArray } from 'drizzle-orm'

const {
  trsDocumentRequests,
  mstCategories,
  mstUsers,
  approvalWorkflows,
  approvalSteps,
  approvalInstances,
  approvalInstanceSteps,
  approvalLogs,
  approvalInbox,
} = schema

export const DocumentRequestRepository = {
  async getAll(page = 1, perPage = 20, keywords = '', categoryId?: number, userId?: number) {
    const baseWhere = isNull(trsDocumentRequests.deletedAt)
    const conditions = [baseWhere]

    if (userId) {
      conditions.push(eq(trsDocumentRequests.createdBy, userId))
    }

    if (keywords) {
      conditions.push(or(
        like(trsDocumentRequests.title, `%${keywords}%`),
        like(mstCategories.name, `%${keywords}%`),
      )!)
    }
    if (categoryId) {
      conditions.push(eq(trsDocumentRequests.categoryId, categoryId))
    }

    const where = and(...conditions)

    const [data, countResult] = await Promise.all([
      db.select({
        id: trsDocumentRequests.id,
        title: trsDocumentRequests.title,
        description: trsDocumentRequests.description,
        categoryId: trsDocumentRequests.categoryId,
        categoryName: mstCategories.name,
        createdBy: trsDocumentRequests.createdBy,
        requesterName: mstUsers.name,
        status: trsDocumentRequests.status,
        revisionNo: trsDocumentRequests.revisionNo,
        createdAt: trsDocumentRequests.createdAt,
        updatedAt: trsDocumentRequests.updatedAt,
      })
        .from(trsDocumentRequests)
        .innerJoin(mstCategories, eq(trsDocumentRequests.categoryId, mstCategories.id))
        .leftJoin(mstUsers, eq(trsDocumentRequests.createdBy, mstUsers.id))
        .where(where)
        .orderBy(desc(trsDocumentRequests.createdAt))
        .limit(perPage)
        .offset((page - 1) * perPage),
      db.select({ value: count() })
        .from(trsDocumentRequests)
        .innerJoin(mstCategories, eq(trsDocumentRequests.categoryId, mstCategories.id))
        .where(where),
    ])

    const total = Number(countResult[0]?.value ?? 0)

    const approvalMap = await this.loadApprovalMap(data.map(r => Number((r as any).id)))

    return {
      items: data.map((r: any) => {
        const approval = approvalMap.get(Number(r.id)) ?? { current_step: null, total_steps: 0, approval_status: null, approver_name: null, approver_type: null }
        return {
          id: Number(r.id),
          title: r.title,
          description: r.description,
          category_id: Number(r.categoryId),
          category_name: r.categoryName,
          created_by: r.createdBy ? Number(r.createdBy) : null,
          requester_name: r.requesterName,
          status: r.status,
          revision_no: r.revisionNo ?? 0,
          current_step: approval.current_step ?? null,
          total_steps: approval.total_steps ?? null,
          approval_status: approval.approval_status ?? null,
          approver_name: approval.approver_name ?? null,
          approver_type: approval.approver_type ?? null,
          created_at: r.createdAt ? new Date(r.createdAt).toISOString() : '',
          updated_at: r.updatedAt ? new Date(r.updatedAt).toISOString() : '',
        }
      }),
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage) || 1,
      },
      access: { can_view: true, can_create: true, can_update: true, can_delete: true },
    }
  },

  async loadApprovalMap(requestIds: number[]) {
    const map = new Map<number, {
      current_step: number | null
      total_steps: number
      approval_status: string | null
      approver_name: string | null
      approver_type: string | null
    }>()
    if (!requestIds.length) return map

    const instances = await db.select().from(approvalInstances)
      .where(and(
        eq(approvalInstances.modelType, 'document_request'),
        inArray(approvalInstances.modelId, requestIds.map(String)),
      ))

    const instanceIds = instances.map(i => i.id)
    if (!instanceIds.length) return map

    const stepRows = await db.select({
      instanceId: approvalInstanceSteps.instanceId,
      stepStatus: approvalInstanceSteps.status,
      stepOrdinal: approvalSteps.step,
      approverType: approvalSteps.approverType,
      approverName: mstUsers.name,
    })
      .from(approvalInstanceSteps)
      .innerJoin(approvalSteps, eq(approvalInstanceSteps.stepId, approvalSteps.id))
      .leftJoin(mstUsers, eq(approvalInstanceSteps.approverUserId, mstUsers.id))
      .where(inArray(approvalInstanceSteps.instanceId, instanceIds))

    const byInstance = new Map<number, typeof stepRows>()
    for (const s of stepRows) {
      const id = Number((s as any).instanceId)
      if (!byInstance.has(id)) byInstance.set(id, [])
      byInstance.get(id)!.push(s)
    }

    for (const inst of instances) {
      const rows = byInstance.get(Number(inst.id)) ?? []
      rows.sort((a, b) => ((a as any).stepOrdinal ?? 0) - ((b as any).stepOrdinal ?? 0))

      // Tampilkan approver pada step aktif sesuai currentStep (mis. step yang
      // ditolak saat status rejected). Jatuh kembali ke step pending pertama
      // jika currentStep tidak tersedia.
      const targetOrdinal = inst.currentStep != null ? Number(inst.currentStep) : null
      let active: any = null
      if (targetOrdinal != null) {
        active = rows.find(r => Number((r as any).stepOrdinal) === targetOrdinal) ?? null
      }
      if (!active) {
        active = rows.find(r => (r as any).stepStatus === 'pending') ?? rows[0]
      }

      map.set(Number(inst.modelId), {
        current_step: inst.currentStep != null ? Number(inst.currentStep) : null,
        total_steps: rows.length,
        approval_status: inst.status,
        approver_name: active ? (active as any).approverName ?? null : null,
        approver_type: active ? (active as any).approverType ?? null : null,
      })
    }

    return map
  },

  async getById(id: number) {
    const row = await db.query.trsDocumentRequests.findFirst({
      where: and(eq(trsDocumentRequests.id, id), isNull(trsDocumentRequests.deletedAt)),
      with: { category: true, requester: true },
    })
    if (!row) return null

    const approvalMap = await this.loadApprovalMap([Number(row.id)])
    const approval = approvalMap.get(Number(row.id)) ?? { current_step: null, total_steps: 0, approval_status: null, approver_name: null, approver_type: null }

    return {
      id: Number(row.id),
      title: row.title,
      description: row.description,
      category_id: Number(row.categoryId),
      category_name: row.category?.name ?? null,
      created_by: row.createdBy ? Number(row.createdBy) : null,
      requester_name: row.requester?.name ?? null,
      status: row.status,
      revision_no: row.revisionNo ?? 0,
      current_step: approval.current_step ?? null,
      total_steps: approval.total_steps ?? null,
      approval_status: approval.approval_status ?? null,
      approver_name: approval.approver_name ?? null,
      approver_type: approval.approver_type ?? null,
      created_at: row.createdAt ? new Date(row.createdAt).toISOString() : '',
      updated_at: row.updatedAt ? new Date(row.updatedAt).toISOString() : '',
    }
  },

  async getDetail(id: number) {
    const row = await db.query.trsDocumentRequests.findFirst({
      where: and(eq(trsDocumentRequests.id, id), isNull(trsDocumentRequests.deletedAt)),
      with: { category: true, requester: true },
    })
    if (!row) return null

    const instance = await db.query.approvalInstances.findFirst({
      where: and(
        eq(approvalInstances.modelType, 'document_request'),
        eq(approvalInstances.modelId, String(id)),
      ),
    })

    let steps: Array<Record<string, unknown>> = []
    let timeline: Array<Record<string, unknown>> = []

    if (instance) {
      const stepRows = await db.select({
        stepId: approvalInstanceSteps.id,
        stepOrdinal: approvalSteps.step,
        approverUserId: approvalInstanceSteps.approverUserId,
        approverName: mstUsers.name,
        approverType: approvalSteps.approverType,
        status: approvalInstanceSteps.status,
        notes: approvalInstanceSteps.notes,
        approvedAt: approvalInstanceSteps.approvedAt,
      })
        .from(approvalInstanceSteps)
        .innerJoin(approvalSteps, eq(approvalInstanceSteps.stepId, approvalSteps.id))
        .leftJoin(mstUsers, eq(approvalInstanceSteps.approverUserId, mstUsers.id))
        .where(eq(approvalInstanceSteps.instanceId, instance.id))
        .orderBy(approvalSteps.step)

      steps = stepRows.map(s => ({
        step_ordinal: Number((s as any).stepOrdinal),
        approver_id: Number((s as any).approverUserId),
        approver_name: (s as any).approverName ?? null,
        approver_type: (s as any).approverType ?? null,
        status: (s as any).status,
        notes: (s as any).notes ?? null,
        approved_at: (s as any).approvedAt ? new Date((s as any).approvedAt).toISOString() : null,
      }))

      const logRows = await db.select({
        id: approvalLogs.id,
        stepOrdinal: approvalSteps.step,
        approverName: mstUsers.name,
        action: approvalLogs.action,
        comment: approvalLogs.comment,
        createdAt: approvalLogs.createdAt,
      })
        .from(approvalLogs)
        .innerJoin(approvalInstanceSteps, eq(approvalLogs.instanceStepId, approvalInstanceSteps.id))
        .innerJoin(approvalSteps, eq(approvalInstanceSteps.stepId, approvalSteps.id))
        .leftJoin(mstUsers, eq(approvalInstanceSteps.approverUserId, mstUsers.id))
        .where(eq(approvalInstanceSteps.instanceId, instance.id))
        .orderBy(asc(approvalLogs.createdAt))

      timeline = logRows.map(l => ({
        id: Number((l as any).id),
        step_ordinal: Number((l as any).stepOrdinal),
        approver_name: (l as any).approverName ?? null,
        action: (l as any).action,
        comment: (l as any).comment ?? null,
        created_at: (l as any).createdAt ? new Date((l as any).createdAt).toISOString() : '',
      }))
    }

    // Posisi approval: approver pada step aktif (sesuai currentStep) adalah
    // yang sedang/akan bertindak. Saat final, tidak ada approver berikutnya.
    const currentStep = instance?.currentStep != null ? Number(instance.currentStep) : null
    const approvalStatus = instance?.status ?? null
    const activeStep = currentStep != null
      ? steps.find(s => Number(s.step_ordinal) === currentStep) ?? null
      : null
    const isPending = approvalStatus === 'pending'

    return {
      id: Number(row.id),
      title: row.title,
      description: row.description,
      category_id: Number(row.categoryId),
      category_name: row.category?.name ?? null,
      created_by: row.createdBy ? Number(row.createdBy) : null,
      requester_name: row.requester?.name ?? null,
      status: row.status,
      revision_no: row.revisionNo ?? 0,
      current_step: currentStep,
      total_steps: steps.length,
      approval_status: approvalStatus,
      next_approver_name: isPending ? (activeStep?.approver_name as string | null) ?? null : null,
      next_approver_type: isPending ? (activeStep?.approver_type as string | null) ?? null : null,
      steps,
      timeline,
      created_at: row.createdAt ? new Date(row.createdAt).toISOString() : '',
      updated_at: row.updatedAt ? new Date(row.updatedAt).toISOString() : '',
    }
  },

  async create(data: { title: string; description?: string; categoryId: number; createdBy?: number | null; status?: string }) {
    const id = await db.transaction(async tx => {
      const result = await tx.insert(trsDocumentRequests).values({
        title: data.title,
        description: data.description || null,
        categoryId: data.categoryId,
        createdBy: data.createdBy ?? null,
        status: 'pending',
      }).returning({ id: trsDocumentRequests.id })

      const insertedId = result[0]?.id
      if (!insertedId) return null

      // Saat submit, langsung resolve approval line berdasarkan category
      // lalu snapshot step-step approver-nya.
      await this.startApproval(tx, Number(insertedId), data.categoryId, data.createdBy ?? null)

      return Number(insertedId)
    })

    return id ? this.getById(id) : null
  },

  async startApproval(tx: any, requestId: number, categoryId: number, requesterId: number | null = null) {
    const workflow = await tx.query.approvalWorkflows.findFirst({
      where: and(
        eq(approvalWorkflows.categoryId, categoryId),
        eq(approvalWorkflows.isActive, true),
      ),
    })
    if (!workflow) return

    const steps = await tx.query.approvalSteps.findMany({
      where: eq(approvalSteps.workflowId, workflow.id),
      orderBy: (s: { step: number; groupNo: number | null }, { asc }: { asc: (col: unknown) => unknown }) => [
        asc(s.step),
        asc(s.groupNo),
      ],
    })
    if (!steps.length) return

    // Snapshot step-step approver (resolve user per step)
    const snapshot: Array<{ stepId: number; stepOrdinal: number; approverUserId: number }> = steps
      .filter((s: { approverType: string; userId: number | null }) => s.approverType === 'user' && s.userId)
      .map((s: { id: number; step: number; userId: number | null }) => ({
        stepId: s.id,
        stepOrdinal: s.step,
        approverUserId: s.userId as number,
      }))

    // Self-approval guard: step yang approver-nya requester otomatis dilewati (skipped)
    const activeSteps = snapshot.filter(s => s.approverUserId !== requesterId)
    const skippedSteps = snapshot.filter(s => s.approverUserId === requesterId)

    const instance = await tx.insert(approvalInstances).values({
      workflowId: workflow.id,
      modelType: 'document_request',
      modelId: String(requestId),
      currentStep: activeSteps.length ? activeSteps[0].stepOrdinal : null,
      status: activeSteps.length ? 'pending' : 'approved',
    }).returning({ id: approvalInstances.id })

    const instanceId = instance[0]?.id
    if (!instanceId) return

    // Insert semua step (aktif + skipped). Step kepunyaan requester langsung
    // bertanda approved + dicatat sebagai "skipped" di log.
    for (const s of snapshot) {
      const isSkipped = s.approverUserId === requesterId
      const [stepRow] = await tx.insert(approvalInstanceSteps).values({
        instanceId,
        stepId: s.stepId,
        approverUserId: s.approverUserId,
        status: isSkipped ? 'approved' : 'pending',
        approvedAt: isSkipped ? new Date() : undefined,
        notes: isSkipped ? 'Self-approval: otomatis dilewati' : undefined,
      }).returning({ id: approvalInstanceSteps.id })

      if (isSkipped && stepRow?.id) {
        await tx.insert(approvalLogs).values({
          instanceStepId: Number(stepRow.id),
          action: 'skipped',
          comment: 'Self-approval: otomatis dilewati',
        })
      }
    }

    if (!activeSteps.length) {
      // Semua approver adalah requester → tidak butuh approval, langsung disetujui
      await tx.update(trsDocumentRequests).set({ status: 'approved' }).where(eq(trsDocumentRequests.id, requestId))
      return
    }

    // Isi inbox dengan approver aktif pertama
    await tx.insert(approvalInbox).values({
      documentRequestId: requestId,
      approverId: activeSteps[0].approverUserId,
    })
  },

  async resubmit(requestId: number, requesterId: number) {
    return db.transaction(async tx => {
      const doc = await tx.query.trsDocumentRequests.findFirst({
        where: and(
          eq(trsDocumentRequests.id, requestId),
          isNull(trsDocumentRequests.deletedAt),
        ),
      })
      if (!doc) throw new Error('Document request tidak ditemukan')
      if (doc.status !== 'rejected') {
        throw new Error('Hanya request berstatus rejected yang dapat direvisi')
      }
      if (doc.createdBy == null || Number(doc.createdBy) !== requesterId) {
        throw new Error('Anda bukan pemilik request ini')
      }

      const instance = await tx.query.approvalInstances.findFirst({
        where: and(
          eq(approvalInstances.modelType, 'document_request'),
          eq(approvalInstances.modelId, String(requestId)),
        ),
      })
      if (!instance) {
        throw new Error('Approval instance tidak ditemukan')
      }
      const instanceId = Number(instance.id)

      // Temukan step yang ditolak. Revisi dikirim ulang ke step yang sama,
      // bukan mulai dari approver awal lagi.
      const stepRows = await tx.select({
        id: approvalInstanceSteps.id,
        stepOrdinal: approvalSteps.step,
        approverUserId: approvalInstanceSteps.approverUserId,
        status: approvalInstanceSteps.status,
      })
        .from(approvalInstanceSteps)
        .innerJoin(approvalSteps, eq(approvalInstanceSteps.stepId, approvalSteps.id))
        .where(eq(approvalInstanceSteps.instanceId, instanceId))
        .orderBy(approvalSteps.step)

      const rejected = stepRows.find(s => (s as any).status === 'rejected')
      if (!rejected) {
        throw new Error('Tidak ditemukan step yang ditolak')
      }

      const rejectedRowId = Number((rejected as any).id)
      const rejectedOrdinal = Number((rejected as any).stepOrdinal)

      // Reset hanya step yang ditolak kembali ke pending; step sebelumnya tetap approved
      await tx.update(approvalInstanceSteps).set({
        status: 'pending',
        approvedAt: null,
        notes: null,
      }).where(eq(approvalInstanceSteps.id, rejectedRowId))

      await tx.update(approvalInstances).set({
        currentStep: rejectedOrdinal,
        status: 'pending',
      }).where(eq(approvalInstances.id, instanceId))

      await tx.insert(approvalLogs).values({
        instanceStepId: rejectedRowId,
        action: 'resubmit',
        comment: 'Revisi dikirim ulang setelah reject',
      })

      // Isi ulang inbox dengan approver dari step yang ditolak
      await tx.delete(approvalInbox).where(eq(approvalInbox.documentRequestId, requestId))
      await tx.insert(approvalInbox).values({
        documentRequestId: requestId,
        approverId: Number((rejected as any).approverUserId),
      })

      const newRevisionNo = (doc.revisionNo ?? 0) + 1

      await tx.update(trsDocumentRequests).set({
        status: 'pending',
        revisionNo: newRevisionNo,
      }).where(eq(trsDocumentRequests.id, requestId))

      return newRevisionNo
    })
  },

  async update(id: number, data: { title?: string; description?: string | null; categoryId?: number; status?: string }) {
    const current = await db.query.trsDocumentRequests.findFirst({
      where: and(eq(trsDocumentRequests.id, id), isNull(trsDocumentRequests.deletedAt)),
    })
    if (current && current.status === 'approved') {
      throw new Error('Request sudah approved, tidak dapat diubah')
    }

    await db.update(trsDocumentRequests).set({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.status !== undefined && { status: data.status }),
    }).where(eq(trsDocumentRequests.id, id))
  },

  async softDelete(id: number) {
    const current = await db.query.trsDocumentRequests.findFirst({
      where: and(eq(trsDocumentRequests.id, id), isNull(trsDocumentRequests.deletedAt)),
    })
    if (current && current.status === 'approved') {
      throw new Error('Request sudah approved, tidak dapat dihapus')
    }

    await db.update(trsDocumentRequests).set({ deletedAt: new Date() }).where(eq(trsDocumentRequests.id, id))
  },
}
