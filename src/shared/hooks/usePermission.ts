'use client'

import { useSession } from 'next-auth/react'

export function usePermission(permission: string): boolean {
  const { data: session } = useSession()
  if (!session?.user?.permissions) return false
  return session.user.permissions.includes(permission)
}

export function usePermissions(): string[] {
  const { data: session } = useSession()
  return session?.user?.permissions || []
}

export function useRoles(): string[] {
  const { data: session } = useSession()
  return session?.user?.roles || []
}

export function hasPermission(permissions: string[], permission: string): boolean {
  return permissions.includes(permission)
}
