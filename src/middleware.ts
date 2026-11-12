import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const AUTH_SECRET = process.env.AUTH_SECRET || ''
const COOKIE_NAME = 'skeleton.session-token'
const SECURE_COOKIE = process.env.COOKIE_SECURE !== 'false'

function getOpts(req: NextRequest) {
  return { req, secret: AUTH_SECRET, cookieName: COOKIE_NAME, secureCookie: SECURE_COOKIE }
}

const PERMISSION_MAP: Record<string, string> = {
  '/dashboard/master-data': 'master-data.view',
  '/dashboard/user-management': 'user.view',
  '/dashboard/configuration': 'configuration.approval-line.view',
  '/api/configuration': 'configuration.approval-line.view',
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isPublicPath =
    pathname.startsWith('/auth/login') ||
    pathname.startsWith('/error') ||
    pathname === '/' ||
    pathname === '/favicon.ico'

  const isPublicApi =
    pathname.startsWith('/api/auth/')

  const isApi = pathname.startsWith('/api/')

  if (isPublicPath || isPublicApi) {
    if (pathname === '/auth/login') {
      const token = await getToken(getOpts(req))
      if (token) {
        const redirectParam = req.nextUrl.searchParams.get('redirect')
        if (redirectParam && redirectParam.startsWith('/dashboard')) {
          return NextResponse.redirect(new URL(redirectParam, req.url))
        }
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
    return NextResponse.next()
  }

  const token = await getToken(getOpts(req))

  if (!token) {
    if (isApi) {
      return NextResponse.json(
        { code: 'E-GE401UN', success: false, message: 'Unauthorized', data: null },
        { status: 401 }
      )
    }
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // Permission-based route guards
  const permissions = (token.permissions as string[]) || []
  for (const [pathPrefix, requiredPermission] of Object.entries(PERMISSION_MAP)) {
    if (pathname.startsWith(pathPrefix) && !permissions.includes(requiredPermission)) {
      if (isApi) {
        return NextResponse.json(
          { code: 'E-GE403FB', success: false, message: 'Forbidden', data: null },
          { status: 403 }
        )
      }
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|assets|uploads|favicon.ico).*)'],
}
