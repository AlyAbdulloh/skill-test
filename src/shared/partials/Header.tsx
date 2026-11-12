'use client'

import { useState, useEffect } from 'react'
import { Menu, X, CalendarDays, Clock3 } from 'lucide-react'
import { useTitle } from '@/src/shared/contexts/TitleContext'
import { UserDropdown } from '@/components/user-dropdown'

interface HeaderProps {
  onMenuClick: () => void
  sidebarOpen: boolean
}

export function Header({ onMenuClick, sidebarOpen }: HeaderProps) {
  const { title, subtitle } = useTitle()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const dateStr = now.toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <header className="sticky top-0 z-30 bg-white h-16 flex items-center justify-between px-4 lg:px-6 border-b border-slate-200">
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex flex-col leading-tight min-w-0">
          <h1 className="font-semibold text-sm lg:text-lg text-slate-800 truncate">{title}</h1>
          {subtitle && (
            <span className="text-xs text-slate-500 truncate hidden sm:block">{subtitle}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
          <CalendarDays size={14} className="text-pink-500" />
          <span>{dateStr}</span>
          <span className="text-slate-300">•</span>
          <Clock3 size={14} className="text-cyan-500" />
          <span className="font-medium text-slate-500">{timeStr}</span>
        </div>

        <UserDropdown />
      </div>
    </header>
  )
}
