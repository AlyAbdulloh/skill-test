import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { importSPKI, jwtVerify } from 'jose'
import { db, schema } from '@/src/core/db'
import { eq, and, isNull } from 'drizzle-orm'
import { verifyPassword } from '@/src/core/auth/password'
import { config } from '@/src/core/config'

const { mstUsers } = schema

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        sso_token: { label: 'SSO Token', type: 'hidden' },
      },
      async authorize(credentials) {
        const mode = config.auth.mode

        // SSO mode
        if (mode === 'sso' && credentials?.sso_token) {
          return authorizeSSO(credentials.sso_token as string)
        }

        // Local mode
        if (credentials?.username && credentials?.password) {
          return authorizeLocal(credentials.username as string, credentials.password as string)
        }

        return null
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: 'skeleton.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.COOKIE_SECURE !== 'false',
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.roles = user.roles
        token.permissions = user.permissions
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.email = token.email as string
      session.user.name = token.name as string
      session.user.roles = (token.roles as string[]) || []
      session.user.permissions = (token.permissions as string[]) || []
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/error',
  },
  trustHost: true,
})

async function authorizeLocal(username: string, password: string) {
  const user = await db.query.mstUsers.findFirst({
    where: and(
      eq(mstUsers.username, username),
      eq(mstUsers.isActive, true),
      isNull(mstUsers.deletedAt),
    ),
    with: {
      userRoles: {
        with: {
          role: {
            with: {
              rolePermissions: {
                with: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!user || !user.passwordHash) return null

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) return null

  const roles = [...new Set(user.userRoles.map(ur => ur.role.name))]
  const permissions = [...new Set(
    user.userRoles.flatMap(ur =>
      ur.role.rolePermissions.map(rp => rp.permission.name)
    )
  )]

  return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    roles,
    permissions,
  }
}

async function authorizeSSO(ssoToken: string) {
  try {
    const pem = config.sso.publicKey.replace(/\\n/g, '\n')
    const publicKey = await importSPKI(pem, 'RS256')
    const { payload } = await jwtVerify(ssoToken, publicKey)

    const username = payload.sub as string
    const rolesFromToken = (payload.roles as string[]) || []

    const user = await db.query.mstUsers.findFirst({
      where: and(
        eq(mstUsers.username, username),
        eq(mstUsers.isActive, true),
        isNull(mstUsers.deletedAt),
      ),
      with: {
        userRoles: {
          with: {
            role: {
              with: {
                rolePermissions: {
                  with: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) return null

    const roles = [...new Set(user.userRoles.map(ur => ur.role.name))]
    const permissions = [...new Set(
      user.userRoles.flatMap(ur =>
        ur.role.rolePermissions.map(rp => rp.permission.name)
      )
    )]

    return {
      id: String(user.id),
      email: user.email,
      name: user.name,
      roles,
      permissions,
    }
  } catch {
    return null
  }
}

declare module 'next-auth' {
  interface User {
    roles: string[]
    permissions: string[]
  }

  interface Session {
    user: {
      id: string
      name: string
      email: string
      roles: string[]
      permissions: string[]
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    roles?: string[]
    permissions?: string[]
  }
}
