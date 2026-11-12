import { auth } from '@/src/core/auth/auth'
import { redirect } from 'next/navigation'
import { RoleTable } from './RoleTable'

export async function RolePage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (!session.user.permissions.includes('role.view')) redirect('/dashboard')
  return <RoleTable />
}
