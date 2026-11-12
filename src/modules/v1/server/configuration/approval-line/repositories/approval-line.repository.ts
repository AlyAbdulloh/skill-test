import { db, schema } from '@/src/core/db'
import { eq, isNull, count, asc, desc, like, or, and, sql } from 'drizzle-orm'
import type { ApprovalLine, ApprovalLinePayload, ApprovalLineStepPayload } from '../domains/approval-line.entity'
import type { Feature } from '../domains/feature.entity'
import type { ApprovalLineList } from '../domains/approval-line.list'

const { approvalWorkflows, approvalSteps, mstFeatures, mstUsers } = schema

export const ApprovalLineRepository = {
  async getAll(page = 1, perPage = 20, keywords = '', featureId?: number): Promise<ApprovalLineList> {
    const baseWhere = isNull(mstFeatures.deletedAt)
    const conditions = [baseWhere]

    if (keywords) {
      conditions.push(or(
        like(approvalWorkflows.name, `%${keywords}%`),
        like(mstFeatures.name, `%${keywords}%`),
      )!)
    }
    if (featureId) {
      conditions.push(eq(approvalWorkflows.featureId, featureId))
    }

    const where = and(...conditions)

    const [data, countResult] = await Promise.all([
      db.select({
        id: approvalWorkflows.id,
        featureId: approvalWorkflows.featureId,
        featureName: mstFeatures.name,
        featureCode: mstFeatures.code,
        featureRoutePath: mstFeatures.routePath,
        divisionId: approvalWorkflows.divisionId,
        departmentId: approvalWorkflows.departmentId,
        name: approvalWorkflows.name,
        isActive: approvalWorkflows.isActive,
        createdAt: approvalWorkflows.createdAt,
        updatedAt: approvalWorkflows.updatedAt,
        stepsCount: sql<number>`(SELECT COUNT(*) FROM approval_steps WHERE approval_steps.workflow_id = ${approvalWorkflows.id})`.mapWith(Number).as('steps_count'),
      })
        .from(approvalWorkflows)
        .innerJoin(mstFeatures, eq(approvalWorkflows.featureId, mstFeatures.id))
        .where(where)
        .orderBy(asc(approvalWorkflows.name))
        .limit(perPage)
        .offset((page - 1) * perPage),
      db.select({ total: count() })
        .from(approvalWorkflows)
        .innerJoin(mstFeatures, eq(approvalWorkflows.featureId, mstFeatures.id))
        .where(where),
    ])

    const total = Number(countResult[0]?.total ?? 0)

    return {
      items: data.map((r: any) => ({
        id: Number(r.id),
        featureId: Number(r.featureId),
        featureName: r.featureName,
        featureCode: r.featureCode,
        featureRoutePath: r.featureRoutePath,
        divisionId: r.divisionId,
        departmentId: r.departmentId,
        name: r.name,
        isActive: Boolean(r.isActive ?? true),
        stepsCount: Number(r.stepsCount || 0),
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : '',
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : '',
      })),
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage) || 1,
      },
    }
  },

  async getById(id: number) {
    const workflow = await db.query.approvalWorkflows.findFirst({
      where: eq(approvalWorkflows.id, id),
      with: { feature: true },
    })
    if (!workflow) return null

    const steps = await db.query.approvalSteps.findMany({
      where: eq(approvalSteps.workflowId, id),
      orderBy: [asc(approvalSteps.step)],
    })

    const stepsWithNames = await Promise.all(steps.map(async (s: any) => {
      let userName: string | null = null
      if (s.userId) {
        const user = await db.query.mstUsers.findFirst({ where: eq(mstUsers.id, s.userId) })
        userName = user?.name ?? null
      }
      return {
        id: Number(s.id),
        workflowId: Number(s.workflowId),
        step: Number(s.step),
        groupNo: Number(s.groupNo ?? 1),
        code: s.code,
        approverType: s.approverType,
        jobLevelId: s.jobLevelId,
        userId: s.userId,
        userName,
        divisionId: s.divisionId,
        jobPositionId: s.jobPositionId,
        groupType: s.groupType ?? 'SEQUENTIAL',
        minApproval: Number(s.minApproval ?? 1),
        isRequired: Boolean(s.isRequired ?? true),
        allowedActions: s.allowedActions ?? 'approve,reject',
        createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : '',
      }
    }))

    return {
      id: Number(workflow.id),
      featureId: Number(workflow.featureId),
      featureName: workflow.feature?.name,
      featureCode: workflow.feature?.code,
      featureRoutePath: workflow.feature?.routePath,
      divisionId: workflow.divisionId,
      departmentId: workflow.departmentId,
      name: workflow.name,
      isActive: Boolean(workflow.isActive ?? true),
      stepsCount: steps.length,
      createdAt: workflow.createdAt ? new Date(workflow.createdAt).toISOString() : '',
      updatedAt: workflow.updatedAt ? new Date(workflow.updatedAt).toISOString() : '',
      steps: stepsWithNames,
    }
  },

  async create(data: ApprovalLinePayload) {
    await db.insert(approvalWorkflows).values({
      featureId: data.featureId,
      name: data.name,
      divisionId: data.divisionId,
      departmentId: data.departmentId,
      isActive: data.isActive ?? true,
    })

    const record = await db.query.approvalWorkflows.findFirst({
      where: and(
        eq(approvalWorkflows.name, data.name),
        eq(approvalWorkflows.featureId, data.featureId),
      ),
      orderBy: [desc(approvalWorkflows.id)],
    })
    return record || { id: 0 }
  },

  async update(id: number, data: Partial<ApprovalLinePayload>) {
    await db.update(approvalWorkflows).set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.featureId !== undefined && { featureId: data.featureId }),
      ...(data.divisionId !== undefined && { divisionId: data.divisionId }),
      ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      updatedAt: new Date(),
    }).where(eq(approvalWorkflows.id, id))
  },

  async delete(id: number) {
    await db.delete(approvalSteps).where(eq(approvalSteps.workflowId, id))
    await db.delete(approvalWorkflows).where(eq(approvalWorkflows.id, id))
  },

  async getSteps(workflowId: number) {
    const steps = await db.query.approvalSteps.findMany({
      where: eq(approvalSteps.workflowId, workflowId),
      orderBy: [asc(approvalSteps.step)],
    })

    return Promise.all(steps.map(async (s: any) => {
      let userName: string | null = null
      if (s.userId) {
        const user = await db.query.mstUsers.findFirst({ where: eq(mstUsers.id, s.userId) })
        userName = user?.name ?? null
      }
      return {
        id: Number(s.id),
        workflowId: Number(s.workflowId),
        step: Number(s.step),
        groupNo: Number(s.groupNo ?? 1),
        code: s.code,
        approverType: s.approverType,
        jobLevelId: s.jobLevelId,
        userId: s.userId,
        userName,
        divisionId: s.divisionId,
        jobPositionId: s.jobPositionId,
        groupType: s.groupType ?? 'SEQUENTIAL',
        minApproval: Number(s.minApproval ?? 1),
        isRequired: Boolean(s.isRequired ?? true),
        allowedActions: s.allowedActions ?? 'approve,reject',
        createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : '',
      }
    }))
  },

  async syncSteps(workflowId: number, steps: ApprovalLineStepPayload[]) {
    await db.transaction(async (tx: any) => {
      const existing = await tx.query.approvalSteps.findMany({
        where: eq(approvalSteps.workflowId, workflowId),
      })
      const incomingIds = new Set(steps.filter(s => s.step > 0).map((_, i) => existing[i]?.id).filter(Boolean))
      const toDelete = existing.filter((e: any) => !incomingIds.has(e.id))

      for (const d of toDelete) {
        await tx.delete(approvalSteps).where(eq(approvalSteps.id, d.id))
      }

      for (let i = 0; i < steps.length; i++) {
        const s = steps[i]
        if (existing[i]) {
          await tx.update(approvalSteps).set({
            step: i + 1,
            groupNo: s.groupNo,
            groupType: s.groupType,
            approverType: s.approverType,
            userId: s.userId,
            jobLevelId: s.jobLevelId,
            divisionId: s.divisionId,
            jobPositionId: s.jobPositionId,
            minApproval: s.minApproval ?? 1,
            isRequired: s.isRequired ?? true,
            allowedActions: s.allowedActions ?? 'approve,reject',
            code: s.code,
          }).where(eq(approvalSteps.id, existing[i].id))
        } else {
          await tx.insert(approvalSteps).values({
            workflowId,
            step: i + 1,
            groupNo: s.groupNo,
            groupType: s.groupType,
            approverType: s.approverType,
            userId: s.userId,
            jobLevelId: s.jobLevelId,
            divisionId: s.divisionId,
            jobPositionId: s.jobPositionId,
            minApproval: s.minApproval ?? 1,
            isRequired: s.isRequired ?? true,
            allowedActions: s.allowedActions ?? 'approve,reject',
            code: s.code,
          })
        }
      }
    })
  },

  async getFeatures(): Promise<Feature[]> {
    const data = await db.query.mstFeatures.findMany({
      where: and(
        eq(mstFeatures.isActive, true),
        isNull(mstFeatures.deletedAt),
        isNull(mstFeatures.parentId),
      ),
      orderBy: [asc(mstFeatures.sortOrder)],
    })

    const children = await db.query.mstFeatures.findMany({
      where: and(
        eq(mstFeatures.isActive, true),
        isNull(mstFeatures.deletedAt),
        sql`${mstFeatures.parentId} IS NOT NULL`,
      ),
      orderBy: [asc(mstFeatures.sortOrder)],
    })

    return [...data, ...children].map((f: any) => ({
      id: Number(f.id),
      parentId: f.parentId ? Number(f.parentId) : null,
      code: f.code,
      name: f.name,
      routePath: f.routePath,
      icon: f.icon,
      sortOrder: Number(f.sortOrder || 0),
      isActive: Boolean(f.isActive ?? true),
    }))
  },

  async getSubmoduleFeatures(keywords = ''): Promise<Feature[]> {
    const where = and(
      sql`${mstFeatures.parentId} IS NOT NULL`,
      eq(mstFeatures.isActive, true),
      isNull(mstFeatures.deletedAt),
      keywords ? like(mstFeatures.name, `%${keywords}%`) : undefined,
    )

    const data = await db.query.mstFeatures.findMany({
      where,
      orderBy: [asc(mstFeatures.sortOrder)],
      limit: 50,
    })

    return data.map((f: any) => ({
      id: Number(f.id),
      parentId: f.parentId ? Number(f.parentId) : null,
      code: f.code,
      name: f.name,
      routePath: f.routePath,
      icon: f.icon,
      sortOrder: Number(f.sortOrder || 0),
      isActive: Boolean(f.isActive ?? true),
    }))
  },

  async getUsers(keywords = '') {
    const where = and(
      eq(mstUsers.isActive, true),
      isNull(mstUsers.deletedAt),
      keywords ? or(like(mstUsers.name, `%${keywords}%`), like(mstUsers.username, `%${keywords}%`)) : undefined,
    )

    const data = await db.query.mstUsers.findMany({
      where,
      orderBy: [asc(mstUsers.name)],
      limit: 50,
    })

    return data.map((u: any) => ({ id: Number(u.id), name: u.name, username: u.username }))
  },
}
