import 'dotenv/config'
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool as PgPool } from 'pg'
import { drizzle as drizzleMysql } from 'drizzle-orm/mysql2'
import mysql, { Pool as MySqlPool } from 'mysql2/promise'
import * as pgSchema from './schema/pg'
import * as mysqlSchema from './schema/mysql'
import { activeSchema } from './schema'

const dialect = (process.env.DB_DIALECT || 'postgresql').toLowerCase()
export const isMysql = dialect === 'mysql'

// Global type augmentation for Next.js hot-reloading
declare global {
  // eslint-disable-next-line no-var
  var __db_instance: { db: any; pool: PgPool | MySqlPool } | undefined
}

function initDb() {
  if (globalThis.__db_instance) {
    return globalThis.__db_instance
  }

  if (isMysql) {
    const connectionUri =
      process.env.MYSQL_URL || 'mysql://root:password@localhost:3306/db_skeleton'
    const pool = mysql.createPool(connectionUri)
    const db = drizzleMysql(pool, { schema: mysqlSchema, mode: 'default' })
    const instance = { db, pool }
    if (process.env.NODE_ENV !== 'production') {
      globalThis.__db_instance = instance
    }
    return instance
  } else {
    const connectionString =
      process.env.POSTGRES_URL || 'postgresql://postgres:password@localhost:5432/db_skeleton'
    const pool = new PgPool({ connectionString })
    const db = drizzlePg(pool, { schema: pgSchema })
    const instance = { db, pool }
    if (process.env.NODE_ENV !== 'production') {
      globalThis.__db_instance = instance
    }
    return instance
  }
}

const current = initDb()

// Export flexible database client and active schema
// Typed against the pg driver for type-safety; the runtime driver follows DB_DIALECT.
export type AppDatabase = NodePgDatabase<typeof pgSchema>
export const db: AppDatabase = current.db as unknown as AppDatabase
export const schema: typeof pgSchema = activeSchema as unknown as typeof pgSchema
export { schema as defaultSchema }
