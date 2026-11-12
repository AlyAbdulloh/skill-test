'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface AuthGuardProps {
  children: ReactNode
  permission?: string
  fallback?: ReactNode
}

export function AuthGuard({ children, permission, fallback }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login')
    }
  }, [status, router])

  if (status === 'loading') return null
  if (!session) return null

  if (permission) {
    const hasPermission = session.user.permissions.includes(permission)
    if (!hasPermission) {
      return fallback ? <>{fallback}</> : null
    }
  }

  return <>{children}</>
}
