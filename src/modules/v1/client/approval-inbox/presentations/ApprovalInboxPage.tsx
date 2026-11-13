import { auth } from '@/src/core/auth/auth'
import { redirect } from 'next/navigation'
import { ApprovalInboxTable } from './ApprovalInboxTable'

export async function ApprovalInboxPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (!session.user.permissions.includes('approval-inbox.view')) redirect('/dashboard')

  return <ApprovalInboxTable />
}
