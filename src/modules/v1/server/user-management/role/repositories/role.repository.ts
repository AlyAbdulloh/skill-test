import { db, schema } from '@/src/core/db'
import { and, eq, asc, desc, isNull, count, like, or } from 'drizzle-orm'

export const RoleRepository = {
  async getAll(page = 1, perPage = 20, keywords = '') {
    const baseWhere = isNull(schema.mstRoles.deletedAt)
    const where = keywords
      ? and(baseWhere, or(like(schema.mstRoles.name, `%${keywords}%`)))
      : baseWhere

    const [data, countResult] = await Promise.all([
      db.query.mstRoles.findMany({
        where,
        orderBy: [asc(schema.mstRoles.name)],
        limit: perPage,
        offset: (page - 1) * perPage,
      }),
      db.select({ value: count() }).from(schema.mstRoles).where(where),
    ])

    const total = Number(countResult[0]?.value ?? 0)

    return {
      items: data.map((r: any) => ({
        id: Number(r.id),
        name: r.name,
        guard_name: r.guardName,
        is_system: Boolean(r.isSystem ?? false),
        is_active: Boolean(r.isActive ?? true),
        description: null,
        created_at: r.createdAt ? new Date(r.createdAt).toISOString() : '',
        updated_at: r.updatedAt ? new Date(r.updatedAt).toISOString() : '',
      })),
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage) || 1,
      },
      access: { can_view: true, can_create: true, can_update: true, can_delete: true },
    }
  },

  async getById(id: number) {
    return db.query.mstRoles.findFirst({
      where: and(eq(schema.mstRoles.id, id), isNull(schema.mstRoles.deletedAt)),
    })
  },

  async create(data: { name: string; guard_name?: string }) {
    await db.insert(schema.mstRoles).values({
      name: data.name,
      guardName: data.guard_name || 'web',
    })

    return db.query.mstRoles.findFirst({
      where: and(eq(schema.mstRoles.name, data.name), isNull(schema.mstRoles.deletedAt)),
      orderBy: [desc(schema.mstRoles.id)],
    })
  },

  async update(id: number, data: { name?: string }) {
    await db.update(schema.mstRoles).set({
      ...(data.name !== undefined && { name: data.name }),
    }).where(eq(schema.mstRoles.id, id))
  },

  async softDelete(id: number) {
    await db.update(schema.mstRoles).set({ deletedAt: new Date() }).where(eq(schema.mstRoles.id, id))
  },

  async getRolePermissions(roleId: number) {
    return db.query.trsRolePermissions.findMany({
      where: eq(schema.trsRolePermissions.roleId, roleId),
      with: { permission: true },
    })
  },

  async syncPermissions(roleId: number, permissionIds: number[]) {
    await db.delete(schema.trsRolePermissions).where(eq(schema.trsRolePermissions.roleId, roleId))
    if (permissionIds.length > 0) {
      await db.insert(schema.trsRolePermissions).values(
        permissionIds.map(pid => ({ roleId, permissionId: pid }))
      )
    }
  },
}
