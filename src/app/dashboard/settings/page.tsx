import { auth } from '@/src/core/auth/auth'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
      <p className="text-sm text-slate-500 mt-1">Application settings</p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-700 mb-4">User Info</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex">
            <dt className="w-32 text-slate-500">Name</dt>
            <dd className="text-slate-800">{session.user.name}</dd>
          </div>
          <div className="flex">
            <dt className="w-32 text-slate-500">Email</dt>
            <dd className="text-slate-800">{session.user.email}</dd>
          </div>
          <div className="flex">
            <dt className="w-32 text-slate-500">Roles</dt>
            <dd className="text-slate-800">{session.user.roles.join(', ') || '-'}</dd>
          </div>
          <div className="flex">
            <dt className="w-32 text-slate-500">Permissions</dt>
            <dd className="text-slate-800">{session.user.permissions.length} permissions</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
