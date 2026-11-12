'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'

export function UserDropdown() {
  const { data: session } = useSession()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const user = session?.user
  if (!user) return null

  const initial = user.name?.charAt(0)?.toUpperCase() || 'U'

  const handleLogout = async () => {
    setConfirmOpen(false)
    await signOut({ redirect: true, callbackUrl: '/auth/login' })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 group cursor-pointer outline-none">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:shadow-md transition-shadow">
            {initial}
          </div>
          <span className="hidden sm:block text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
            {user.name}
          </span>
          <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-56">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-sm font-medium text-slate-800">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>

          <div className="py-1">
            <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
              <Settings size={16} className="text-slate-500" />
              Settings
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator />

          <div className="py-1">
            <DropdownMenuItem
              variant="destructive"
              className="flex items-center gap-3 px-3 py-2"
              onClick={() => setConfirmOpen(true)}
            >
              <LogOut size={16} />
              Logout
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmLabel="Logout"
        variant="danger"
      />
    </>
  )
}
