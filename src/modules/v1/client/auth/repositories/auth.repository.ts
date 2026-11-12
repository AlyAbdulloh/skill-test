import { signIn, signOut, getSession } from 'next-auth/react'

export const AuthRepository = {
  async login(credentials: { username?: string; password?: string; sso_token?: string }) {
    return signIn('credentials', {
      ...credentials,
      redirect: false,
    })
  },

  async logout(callbackUrl = '/login') {
    return signOut({ callbackUrl })
  },

  async getSession() {
    return getSession()
  },
}
