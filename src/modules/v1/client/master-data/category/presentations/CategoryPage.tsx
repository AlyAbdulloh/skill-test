import { auth } from '@/src/core/auth/auth'
import { redirect } from 'next/navigation'
import { CategoryTable } from './CategoryTable'

export async function CategoryPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (!session.user.permissions.includes('master-data.view')) redirect('/dashboard')

  return <CategoryTable />
}
