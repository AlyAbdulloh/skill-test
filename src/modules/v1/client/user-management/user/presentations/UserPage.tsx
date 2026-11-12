import { auth } from '@/src/core/auth/auth'
import { redirect } from 'next/navigation'
import { UserTable } from './UserTable'

export async function UserPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (!session.user.permissions.includes('user.view')) redirect('/dashboard')
  return <UserTable />
}
