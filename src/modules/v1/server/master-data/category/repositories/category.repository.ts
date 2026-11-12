import { db, schema } from '@/src/core/db'
import { and, eq, asc, desc, isNull, count, like, or } from 'drizzle-orm'

export const CategoryRepository = {
  async getAll(page = 1, perPage = 20, keywords = '') {
    const baseWhere = isNull(schema.mstCategories.deletedAt)

    const where = keywords
      ? and(
          baseWhere,
          or(
            like(schema.mstCategories.name, `%${keywords}%`),
            like(schema.mstCategories.code, `%${keywords}%`),
          )
        )
      : baseWhere

    const [data, countResult] = await Promise.all([
      db.query.mstCategories.findMany({
        where,
        orderBy: [asc(schema.mstCategories.name)],
        limit: perPage,
        offset: (page - 1) * perPage,
      }),
      db.select({ value: count() }).from(schema.mstCategories).where(where),
    ])

    const total = Number(countResult[0]?.value ?? 0)

    return {
      items: data.map((c: any) => ({
        id: Number(c.id),
        code: c.code,
        name: c.name,
        description: c.description,
        is_active: Boolean(c.isActive ?? true),
        created_at: c.createdAt ? new Date(c.createdAt).toISOString() : '',
        updated_at: c.updatedAt ? new Date(c.updatedAt).toISOString() : '',
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
    return db.query.mstCategories.findFirst({
      where: and(eq(schema.mstCategories.id, id), isNull(schema.mstCategories.deletedAt)),
    })
  },

  async create(data: { name: string; code?: string; description?: string }) {
    await db.insert(schema.mstCategories).values({
      name: data.name,
      code: data.code || null,
      description: data.description || null,
    })
    return db.query.mstCategories.findFirst({
      where: and(
        eq(schema.mstCategories.name, data.name),
        isNull(schema.mstCategories.deletedAt)
      ),
      orderBy: [desc(schema.mstCategories.id)],
    })
  },

  async update(id: number, data: { name?: string; code?: string; description?: string; is_active?: boolean }) {
    await db.update(schema.mstCategories).set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.code !== undefined && { code: data.code }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.is_active !== undefined && { isActive: data.is_active }),
    }).where(eq(schema.mstCategories.id, id))
  },

  async softDelete(id: number) {
    await db.update(schema.mstCategories).set({ deletedAt: new Date() }).where(eq(schema.mstCategories.id, id))
  },
}
