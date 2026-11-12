import { auth } from '@/src/core/auth/auth'
import { redirect } from 'next/navigation'
import { PermissionTable } from './PermissionTable'

export async function PermissionPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (!session.user.permissions.includes('permission.view')) redirect('/dashboard')
  return <PermissionTable />
}
