import { auth } from '@/src/core/auth/auth'
import { redirect } from 'next/navigation'
import { DocumentRequestTable } from './DocumentRequestTable'

export async function DocumentRequestPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (!session.user.permissions.includes('document-request.view')) redirect('/dashboard')

  return <DocumentRequestTable />
}
