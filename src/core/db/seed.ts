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
    { name: 'document-request.view', guardName: 'web' },
    { name: 'document-request.manage', guardName: 'web' },
    { name: 'document-request.resubmit', guardName: 'web' },
    { name: 'approval-inbox.view', guardName: 'web' },
    { name: 'approval-inbox.manage', guardName: 'web' },
  ])
  const permissions = await db.query.mstPermissions.findMany()
  console.log(`  ${permissions.length} permissions created`)

  const permMap = Object.fromEntries(permissions.map(p => [p.name, p.id]))

  // ─── ROLES ──────────────────────────────────────────────
  await db.insert(schema.mstRoles).values([
    { name: 'super-admin', guardName: 'web', isSystem: true },
    { name: 'admin', guardName: 'web', isSystem: true },
    { name: 'viewer', guardName: 'web', isSystem: true },
    { name: 'approver', guardName: 'web', isSystem: true },
  ])
  console.log('  4 roles created')

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
    { roleId: roleMap['admin'], permissionId: permMap['document-request.view'] },
    { roleId: roleMap['admin'], permissionId: permMap['document-request.manage'] },
    { roleId: roleMap['admin'], permissionId: permMap['document-request.resubmit'] },
    { roleId: roleMap['admin'], permissionId: permMap['approval-inbox.view'] },
    { roleId: roleMap['admin'], permissionId: permMap['approval-inbox.manage'] },
    // viewer: view only
    { roleId: roleMap['viewer'], permissionId: permMap['master-data.view'] },
    { roleId: roleMap['viewer'], permissionId: permMap['user.view'] },
    { roleId: roleMap['viewer'], permissionId: permMap['role.view'] },
    { roleId: roleMap['viewer'], permissionId: permMap['permission.view'] },
    { roleId: roleMap['viewer'], permissionId: permMap['configuration.approval-line.view'] },
    { roleId: roleMap['viewer'], permissionId: permMap['document-request.view'] },
    { roleId: roleMap['viewer'], permissionId: permMap['approval-inbox.view'] },
    // approver: can submit document requests & approve inbox
    { roleId: roleMap['approver'], permissionId: permMap['document-request.view'] },
    { roleId: roleMap['approver'], permissionId: permMap['document-request.manage'] },
    { roleId: roleMap['approver'], permissionId: permMap['document-request.resubmit'] },
    { roleId: roleMap['approver'], permissionId: permMap['approval-inbox.view'] },
    { roleId: roleMap['approver'], permissionId: permMap['approval-inbox.manage'] },
  ]
  await db.insert(schema.trsRolePermissions).values(rolePermValues)
  console.log(`  ${rolePermValues.length} role permissions assigned`)

  // ─── USERS ──────────────────────────────────────────────
  const adminHash = await hashPassword('admin123')
  const viewerHash = await hashPassword('viewer123')
  const approverHash = await hashPassword('approver123')

  const approverUsers = Array.from({ length: 5 }, (_, i) => ({
    username: `approver${i + 1}`,
    email: `approver${i + 1}@skeleton.local`,
    name: `Approver ${i + 1}`,
    passwordHash: approverHash,
    isActive: true,
  }))

  await db.insert(schema.mstUsers).values([
    { username: 'admin', email: 'admin@skeleton.local', name: 'Super Admin', passwordHash: adminHash, isActive: true },
    { username: 'viewer', email: 'viewer@skeleton.local', name: 'Viewer User', passwordHash: viewerHash, isActive: true },
    ...approverUsers,
  ])
  const users = await db.query.mstUsers.findMany()
  const userMap = Object.fromEntries(users.map(u => [u.username, u.id]))
  console.log(`  ${users.length} users created`)

  // ─── USER ROLES ─────────────────────────────────────────
  await db.insert(schema.trsUserRoles).values([
    { userId: userMap['admin'], roleId: roleMap['super-admin'] },
    { userId: userMap['viewer'], roleId: roleMap['viewer'] },
    ...approverUsers.map(u => ({ userId: userMap[u.username], roleId: roleMap['approver'] })),
  ])
  console.log('  User roles assigned')

  // ─── CATEGORIES (sample) ────────────────────────────────
  await db.insert(schema.mstCategories).values([
    { code: 'SDM', name: 'Sumber Daya Manusia', description: 'Kategori untuk dokumen terkait SDM', isActive: true },
    { code: 'IT', name: 'Teknologi Informasi', description: 'Kategori untuk dokumen terkait IT', isActive: true },
    { code: 'FIN', name: 'Keuangan', description: 'Kategori untuk dokumen terkait keuangan', isActive: true },
  ])
  const categories = await db.query.mstCategories.findMany()
  console.log(`  ${categories.length} sample categories created`)

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

  // ─── APPROVAL WORKFLOWS per CATEGORY ────────────────────
  // Setiap kategori punya workflow; step memakai approverType 'user'.
  // SDM: 2 step | IT: 3 step | FIN: 2 step
  const catMap = Object.fromEntries(categories.map(c => [c.code, c.id]))

  const workflowValues = [
    { categoryId: catMap['SDM'], name: 'SDM Approval', isActive: true },
    { categoryId: catMap['IT'], name: 'IT Approval', isActive: true },
    { categoryId: catMap['FIN'], name: 'FIN Approval', isActive: true },
  ]
  const insertedWorkflows = await db.insert(schema.approvalWorkflows)
    .values(workflowValues)
    .returning({
      id: schema.approvalWorkflows.id,
      categoryId: schema.approvalWorkflows.categoryId,
    })
  const workflowByCategory = new Map(insertedWorkflows.map(w => [Number(w.categoryId), Number(w.id)]))

  const stepBuilder = (workflowId: number, steps: Array<{ step: number; username: string }>) =>
    steps.map(s => ({
      workflowId,
      step: s.step,
      groupNo: 1,
      approverType: 'user',
      userId: userMap[s.username],
      groupType: 'SEQUENTIAL',
      minApproval: 1,
      isRequired: true,
      allowedActions: 'approve,reject',
    }))

  const approvalStepValues = [
    ...stepBuilder(workflowByCategory.get(catMap['SDM'])!, [
      { step: 1, username: 'approver1' },
      { step: 2, username: 'approver2' },
    ]),
    ...stepBuilder(workflowByCategory.get(catMap['IT'])!, [
      { step: 1, username: 'approver1' },
      { step: 2, username: 'approver3' },
      { step: 3, username: 'approver5' },
    ]),
    ...stepBuilder(workflowByCategory.get(catMap['FIN'])!, [
      { step: 1, username: 'approver2' },
      { step: 2, username: 'approver4' },
    ]),
  ]
  await db.insert(schema.approvalSteps).values(approvalStepValues)
  console.log(`  ${workflowValues.length} approval workflows created (${approvalStepValues.length} steps)`)

  console.log('\nSeed completed!')
  console.log('  Login: admin / admin123')
  console.log('  Login: viewer / viewer123')
  console.log('  Login: approver1..5 / approver123')
}

main().catch(console.error)
