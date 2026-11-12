'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/src/shared/partials/Sidebar'
import { Header } from '@/src/shared/partials/Header'
import { TitleProvider } from '@/src/shared/contexts/TitleContext'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(window.innerWidth >= 1024)
  }, [])

  return (
    <TitleProvider>
      <div className="min-h-screen flex bg-[#f9fbff]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-0'}`}>
          <Header onMenuClick={() => setSidebarOpen(prev => !prev)} sidebarOpen={sidebarOpen} />

          <main className="flex-1 p-6 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TitleProvider>
  )
}
