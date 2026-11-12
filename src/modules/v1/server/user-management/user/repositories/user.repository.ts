import { db, schema } from '@/src/core/db'
import { and, eq, asc, desc, isNull, count, like, or } from 'drizzle-orm'
import { hashPassword } from '@/src/core/auth/password'

export const UserRepository = {
  async getAll(page = 1, perPage = 20, keywords = '') {
    const baseWhere = isNull(schema.mstUsers.deletedAt)
    const where = keywords
      ? and(baseWhere, or(
          like(schema.mstUsers.name, `%${keywords}%`),
          like(schema.mstUsers.username, `%${keywords}%`),
          like(schema.mstUsers.email, `%${keywords}%`),
        ))
      : baseWhere

    const [data, countResult] = await Promise.all([
      db.query.mstUsers.findMany({
        where,
        orderBy: [asc(schema.mstUsers.name)],
        limit: perPage,
        offset: (page - 1) * perPage,
        with: {
          userRoles: { with: { role: true } },
        },
      }),
      db.select({ value: count() }).from(schema.mstUsers).where(where),
    ])

    const total = Number(countResult[0]?.value ?? 0)

    return {
      items: data.map((u: any) => ({
        id: Number(u.id),
        username: u.username,
        email: u.email,
        name: u.name,
        is_active: Boolean(u.isActive ?? true),
        created_at: u.createdAt ? new Date(u.createdAt).toISOString() : '',
        updated_at: u.updatedAt ? new Date(u.updatedAt).toISOString() : '',
        roles: (u.userRoles || []).map((ur: any) => ur.role?.name).filter(Boolean),
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
    return db.query.mstUsers.findFirst({
      where: and(eq(schema.mstUsers.id, id), isNull(schema.mstUsers.deletedAt)),
      with: { userRoles: { with: { role: true } } },
    })
  },

  async create(data: { username: string; email: string; name: string; password: string }) {
    const passwordHash = await hashPassword(data.password)
    await db.insert(schema.mstUsers).values({
      username: data.username,
      email: data.email,
      name: data.name,
      passwordHash,
    })

    return db.query.mstUsers.findFirst({
      where: and(eq(schema.mstUsers.username, data.username), isNull(schema.mstUsers.deletedAt)),
      orderBy: [desc(schema.mstUsers.id)],
    })
  },

  async update(id: number, data: { username?: string; email?: string; name?: string; is_active?: boolean; password?: string }) {
    const updateData: Record<string, any> = {}
    if (data.username !== undefined) updateData.username = data.username
    if (data.email !== undefined) updateData.email = data.email
    if (data.name !== undefined) updateData.name = data.name
    if (data.is_active !== undefined) updateData.isActive = data.is_active
    if (data.password) updateData.passwordHash = await hashPassword(data.password)

    await db.update(schema.mstUsers).set(updateData).where(eq(schema.mstUsers.id, id))
  },

  async softDelete(id: number) {
    await db.update(schema.mstUsers).set({ deletedAt: new Date() }).where(eq(schema.mstUsers.id, id))
  },

  async assignRole(userId: number, roleId: number) {
    const existing = await db.query.trsUserRoles.findFirst({
      where: and(
        eq(schema.trsUserRoles.userId, userId),
        eq(schema.trsUserRoles.roleId, roleId),
      ),
    })
    if (!existing) {
      await db.insert(schema.trsUserRoles).values({ userId, roleId })
    }
  },

  async revokeRole(userId: number, roleId: number) {
    await db.delete(schema.trsUserRoles).where(
      and(
        eq(schema.trsUserRoles.userId, userId),
        eq(schema.trsUserRoles.roleId, roleId),
      )
    )
  },
}
