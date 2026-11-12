import { auth } from '@/src/core/auth/auth'
import { redirect } from 'next/navigation'
import { ApprovalLinePage } from '@/modules/v1/client/configuration/approval-line/presentations/ApprovalLinePage'

export default async function ApprovalLineRoute() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (!session.user.permissions.includes('configuration.approval-line.view')) redirect('/dashboard')

  return <ApprovalLinePage />
}
