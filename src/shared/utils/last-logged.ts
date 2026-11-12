import type { LastLoggedAccount } from '@/modules/v1/client/auth/domains/auth.entity'

const LAST_LOGGED_ACCOUNTS_KEY = 'lastLoggedAccounts'
const MAX_ACCOUNTS = 4

export function getLastLoggedAccounts(): LastLoggedAccount[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(LAST_LOGGED_ACCOUNTS_KEY)
    if (!stored) return []

    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function addLastLoggedAccount(account: { username: string; name: string }): void {
  if (typeof window === 'undefined') return

  try {
    const accounts = getLastLoggedAccounts()

    const filtered = accounts.filter(a => a.username !== account.username)

    const updated = [
      { ...account, lastLogin: Date.now() },
      ...filtered,
    ].slice(0, MAX_ACCOUNTS)

    localStorage.setItem(LAST_LOGGED_ACCOUNTS_KEY, JSON.stringify(updated))
  } catch {
    console.error('Failed to save last logged account')
  }
}

export function removeLastLoggedAccount(username: string): void {
  if (typeof window === 'undefined') return

  try {
    const accounts = getLastLoggedAccounts()
    const filtered = accounts.filter(a => a.username !== username)
    localStorage.setItem(LAST_LOGGED_ACCOUNTS_KEY, JSON.stringify(filtered))
  } catch {
    console.error('Failed to remove last logged account')
  }
}

export function clearLastLoggedAccounts(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(LAST_LOGGED_ACCOUNTS_KEY)
}
