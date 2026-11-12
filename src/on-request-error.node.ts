import { Loggers } from '@/src/shared/utils/logger'

function extractModuleFromPath(path: string): keyof typeof Loggers {
  if (!path) return 'general'

  const segments = path.split('/').filter(Boolean)

  const moduleSegment = segments.find(
    (s) => !['api', 'v1', 'v2', 'configuration', 'master-data', 'user-management'].includes(s.toLowerCase()),
  )

  if (!moduleSegment) return 'general'

  const moduleMap: Record<string, keyof typeof Loggers> = {
    category: 'category',
    categories: 'category',
    user: 'user',
    users: 'user',
    role: 'role',
    roles: 'role',
    permission: 'permission',
    permissions: 'permission',
    'approval-line': 'approval_line',
    auth: 'auth',
  }

  return moduleMap[moduleSegment.toLowerCase()] || 'general'
}

export default async function onRequestError(
  err: unknown,
  request: { path: string; method: string },
  context: { routerKind: string; routePath: string; routeType: string },
) {
  const module = extractModuleFromPath(context.routePath)
  const logger = Loggers[module] || Loggers.general

  const message = err instanceof Error ? err.message : String(err)
  const meta: Record<string, unknown> = {
    routePath: context.routePath,
    routerKind: context.routerKind,
    routeType: context.routeType,
    method: request.method,
  }

  if (err instanceof Error && err.stack) {
    meta.stack = err.stack
  }

  logger.error(`[${module.toUpperCase()}] Unhandled error`, meta)
}
