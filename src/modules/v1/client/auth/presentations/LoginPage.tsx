'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthRepository } from '../repositories/auth.repository'
import { toast } from 'sonner'
import { getLastLoggedAccounts, addLastLoggedAccount, removeLastLoggedAccount } from '@/src/shared/utils/last-logged'
import { LoginForm } from './components/LoginForm'

const branding = {
  systemName: 'Skeleton',
  systemDescription: 'A reusable application skeleton for building modern web applications with role-based access control, master data management, and modular architecture.',
  primaryColor: ['#ec4899', '#00add7'],
  secondaryColor: '#ec4899',
}

export default function LoginPage({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [accounts, setAccounts] = useState<{ username: string; name: string; lastLogin: string }[]>([])

  useEffect(() => {
    setAccounts(getLastLoggedAccounts().map(a => ({ ...a, lastLogin: new Date(a.lastLogin).toISOString() })))
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    setFormErrors({})

    try {
      const result = await AuthRepository.login({ username, password })

      if (result?.error) {
        toast.error('Username atau password salah')
        setFormErrors({ username: 'Invalid credentials' })
        return
      }

      addLastLoggedAccount({ username, name: username })
      setAccounts(getLastLoggedAccounts().map(a => ({ ...a, lastLogin: new Date(a.lastLogin).toISOString() })))

      toast.success('Welcome back!')
      router.replace(redirectTo || '/dashboard')
    } catch {
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = (accountUsername: string) => {
    removeLastLoggedAccount(accountUsername)
    setAccounts(getLastLoggedAccounts().map(a => ({ ...a, lastLogin: new Date(a.lastLogin).toISOString() })))
  }

  return (
    <LoginForm
      branding={branding}
      accounts={accounts}
      username={username}
      password={password}
      showPassword={showPassword}
      onShowPasswordChange={setShowPassword}
      onUsernameChange={setUsername}
      onPasswordChange={setPassword}
      onSubmit={handleLogin}
      onAccountClick={(u) => setUsername(u)}
      onAccountDelete={handleDeleteAccount}
      formErrors={formErrors}
      loading={loading}
    />
  )
}
