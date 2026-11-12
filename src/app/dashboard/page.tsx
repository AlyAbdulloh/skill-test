import { auth } from '@/src/core/auth/auth'
import { redirect } from 'next/navigation'
import { db, schema } from '@/src/core/db'
import { count, eq, isNull } from 'drizzle-orm'
import Link from 'next/link'
import { Users, Shield, KeyRound, FolderTree, Activity, ChevronRight } from 'lucide-react'

const { mstUsers, mstRoles, mstPermissions, mstCategories } = schema

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const [
    [{ total: totalUsers }],
    [{ total: activeUsers }],
    [{ total: totalRoles }],
    [{ total: totalPermissions }],
    [{ total: totalCategories }],
    recentCategories,
    roles,
  ] = await Promise.all([
    db.select({ total: count() }).from(mstUsers).where(isNull(mstUsers.deletedAt)),
    db.select({ total: count() }).from(mstUsers).where(eq(mstUsers.isActive, true)),
    db.select({ total: count() }).from(mstRoles),
    db.select({ total: count() }).from(mstPermissions),
    db.select({ total: count() }).from(mstCategories),
    db.query.mstCategories.findMany({ limit: 5, orderBy: (c, { desc }) => [desc(c.createdAt)] }),
    db.query.mstRoles.findMany(),
  ])

  const stats = [
    { label: 'Total Users', count: totalUsers, icon: Users, href: '/dashboard/user-management/user', gradient: 'from-cyan-500 to-blue-500' },
    { label: 'Active Users', count: activeUsers, icon: Activity, href: '/dashboard/user-management/user', gradient: 'from-green-500 to-emerald-500' },
    { label: 'Roles', count: totalRoles, icon: Shield, href: '/dashboard/user-management/role', gradient: 'from-purple-500 to-pink-500' },
    { label: 'Permissions', count: totalPermissions, icon: KeyRound, href: '/dashboard/user-management/permission', gradient: 'from-orange-500 to-red-500' },
    { label: 'Categories', count: totalCategories, icon: FolderTree, href: '/dashboard/master-data/category', gradient: 'from-cyan-500 to-pink-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Welcome back, {session.user.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Here&apos;s what&apos;s happening across your modules</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 group block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-1">{stat.count}</p>
              <p className="text-xs font-medium text-slate-500">{stat.label}</p>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-pink-500 shadow-sm">
              <FolderTree className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">Recent Categories</h3>
          </div>
          {recentCategories.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No categories yet</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentCategories.map(cat => (
                <li key={cat.id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-slate-500 truncate">{cat.description}</p>
                    )}
                  </div>
                  {cat.code && (
                    <span className="ml-3 shrink-0 inline-flex items-center rounded-lg bg-cyan-50 px-2 py-0.5 text-xs font-semibold text-cyan-700 border border-cyan-200 uppercase">
                      {cat.code}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">System Roles</h3>
          </div>
          {roles.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No roles configured</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {roles.map(role => (
                <li key={role.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{role.name}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    role.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {role.isActive ? 'Active' : 'Inactive'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
