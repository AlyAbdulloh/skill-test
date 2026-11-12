import { db } from './index'
import { sql } from 'drizzle-orm'

async function main() {
  console.log('Dropping all tables...')

  await db.execute(sql`DROP TABLE IF EXISTS approval_instance_steps CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS approval_logs CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS approval_instances CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS approval_steps CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS approval_workflows CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS mst_features CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS trs_role_permissions CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS trs_user_roles CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS mst_permissions CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS mst_roles CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS mst_users CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS mst_categories CASCADE`)

  console.log('All tables dropped!')
}

main().catch(console.error)
