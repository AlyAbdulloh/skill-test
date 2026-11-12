import 'dotenv/config'
import { db, schema } from './index'
import { hashPassword } from '@/src/core/auth/password'

async function main() {
  console.log('Seeding database...')

  // ─── PERMISSIONS ────────────────────────────────────────
  await db.insert(schema.mstPermissions).values([
    { name: 'master-data.view', guardName: 'web' },
    { name: 'master-data.manage', guardName: 'web' },
    { name: 'user.view', guardName: 'web' },
    { name: 'user.manage', guardName: 'web' },
    { name: 'role.view', guardName: 'web' },
    { name: 'role.manage', guardName: 'web' },
    { name: 'permission.view', guardName: 'web' },
    { name: 'configuration.approval-line.view', guardName: 'web' },
    { name: 'configuration.approval-line.manage', guardName: 'web' },
  ])
  const permissions = await db.query.mstPermissions.findMany()
  console.log(`  ${permissions.length} permissions created`)

  const permMap = Object.fromEntries(permissions.map(p => [p.name, p.id]))

  // ─── ROLES ──────────────────────────────────────────────
  await db.insert(schema.mstRoles).values([
    { name: 'super-admin', guardName: 'web', isSystem: true },
    { name: 'admin', guardName: 'web', isSystem: true },
    { name: 'viewer', guardName: 'web', isSystem: true },
  ])
  console.log('  3 roles created')

  const allRoles = await db.query.mstRoles.findMany()
  const roleMap = Object.fromEntries(allRoles.map(r => [r.name, r.id]))

  // ─── ROLE PERMISSIONS ───────────────────────────────────
  const rolePermValues = [
    // super-admin: all permissions
    ...permissions.map(p => ({ roleId: roleMap['super-admin'], permissionId: p.id })),
    // admin: manage master-data + user + role + configuration
    { roleId: roleMap['admin'], permissionId: permMap['master-data.view'] },
    { roleId: roleMap['admin'], permissionId: permMap['master-data.manage'] },
    { roleId: roleMap['admin'], permissionId: permMap['user.view'] },
    { roleId: roleMap['admin'], permissionId: permMap['user.manage'] },
    { roleId: roleMap['admin'], permissionId: permMap['role.view'] },
    { roleId: roleMap['admin'], permissionId: permMap['role.manage'] },
    { roleId: roleMap['admin'], permissionId: permMap['permission.view'] },
    { roleId: roleMap['admin'], permissionId: permMap['configuration.approval-line.view'] },
    { roleId: roleMap['admin'], permissionId: permMap['configuration.approval-line.manage'] },
    // viewer: view only
    { roleId: roleMap['viewer'], permissionId: permMap['master-data.view'] },
    { roleId: roleMap['viewer'], permissionId: permMap['user.view'] },
    { roleId: roleMap['viewer'], permissionId: permMap['role.view'] },
    { roleId: roleMap['viewer'], permissionId: permMap['permission.view'] },
    { roleId: roleMap['viewer'], permissionId: permMap['configuration.approval-line.view'] },
  ]
  await db.insert(schema.trsRolePermissions).values(rolePermValues)
  console.log(`  ${rolePermValues.length} role permissions assigned`)

  // ─── USERS ──────────────────────────────────────────────
  const adminHash = await hashPassword('admin123')
  const viewerHash = await hashPassword('viewer123')

  await db.insert(schema.mstUsers).values([
    { username: 'admin', email: 'admin@skeleton.local', name: 'Super Admin', passwordHash: adminHash, isActive: true },
    { username: 'viewer', email: 'viewer@skeleton.local', name: 'Viewer User', passwordHash: viewerHash, isActive: true },
  ])
  const users = await db.query.mstUsers.findMany()
  console.log('  2 users created')

  // ─── USER ROLES ─────────────────────────────────────────
  await db.insert(schema.trsUserRoles).values([
    { userId: users[0].id, roleId: roleMap['super-admin'] },
    { userId: users[1].id, roleId: roleMap['viewer'] },
  ])
  console.log('  User roles assigned')

  // ─── CATEGORIES (sample) ────────────────────────────────
  await db.insert(schema.mstCategories).values([
    { code: 'SDM', name: 'Sumber Daya Manusia', description: 'Kategori untuk dokumen terkait SDM', isActive: true },
    { code: 'IT', name: 'Teknologi Informasi', description: 'Kategori untuk dokumen terkait IT', isActive: true },
    { code: 'FIN', name: 'Keuangan', description: 'Kategori untuk dokumen terkait keuangan', isActive: true },
  ])
  console.log('  3 sample categories created')

  // ─── FEATURES ───────────────────────────────────────────
  await db.insert(schema.mstFeatures).values([
    { code: 'DASHBOARD', name: 'Dashboard', routePath: '/dashboard', icon: 'LayoutDashboard', sortOrder: 0, parentId: null },
  ])
  const dashboardFeature = await db.query.mstFeatures.findFirst({
    where: (f, { eq }) => eq(f.code, 'DASHBOARD'),
  })

  await db.insert(schema.mstFeatures).values([
    { code: 'CATEGORY', name: 'Category', routePath: '/dashboard/master-data/category', icon: 'FolderTree', sortOrder: 1, parentId: dashboardFeature!.id },
    { code: 'USER', name: 'Users', routePath: '/dashboard/user-management/user', icon: 'Users', sortOrder: 2, parentId: dashboardFeature!.id },
    { code: 'ROLE', name: 'Roles', routePath: '/dashboard/user-management/role', icon: 'Shield', sortOrder: 3, parentId: dashboardFeature!.id },
    { code: 'PERMISSION', name: 'Permissions', routePath: '/dashboard/user-management/permission', icon: 'KeyRound', sortOrder: 4, parentId: dashboardFeature!.id },
    { code: 'APPROVAL_LINE', name: 'Approval Lines', routePath: '/dashboard/configuration/approval-line', icon: 'GitBranch', sortOrder: 5, parentId: dashboardFeature!.id },
  ])
  const features = await db.query.mstFeatures.findMany({
    where: (f, { ne }) => ne(f.code, 'DASHBOARD'),
  })
  console.log(`  ${features.length + 1} features created`)

  // ─── SAMPLE APPROVAL WORKFLOW ───────────────────────────
  await db.insert(schema.approvalWorkflows).values([
    { featureId: features[0].id, name: 'Category Approval', isActive: true },
  ])
  const workflow = await db.query.approvalWorkflows.findFirst()

  await db.insert(schema.approvalSteps).values([
    { workflowId: workflow!.id, step: 1, groupNo: 1, approverType: 'user', userId: users[0].id, groupType: 'SEQUENTIAL', minApproval: 1, isRequired: true, allowedActions: 'approve,reject' },
  ])
  console.log('  1 sample approval workflow created')

  console.log('\nSeed completed!')
  console.log('  Login: admin / admin123')
  console.log('  Login: viewer / viewer123')
}

main().catch(console.error)
