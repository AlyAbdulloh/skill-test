import { db, schema } from '@/src/core/db'
import { isNull, asc } from 'drizzle-orm'

export const PermissionRepository = {
  async getAll() {
    const data = await db.query.mstPermissions.findMany({
      where: isNull(schema.mstPermissions.deletedAt),
      orderBy: [asc(schema.mstPermissions.name)],
    })

    return data.map((p: any) => ({
      id: Number(p.id),
      name: p.name,
      description: p.description,
      guard_name: p.guardName,
      created_at: p.createdAt ? new Date(p.createdAt).toISOString() : '',
      updated_at: p.updatedAt ? new Date(p.updatedAt).toISOString() : '',
    }))
  },
}
