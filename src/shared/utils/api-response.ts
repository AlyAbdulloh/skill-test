import { NextResponse } from 'next/server'
import type { ApiResponse } from '@/src/shared/types/api-response'

export function apiSuccess<T>(data: T, message = 'Success'): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    code: 'S-000',
    success: true,
    message,
    data,
  })
}

export function apiError(message: string, code = 'E-000', status = 400) {
  return NextResponse.json(
    {
      code,
      success: false,
      message,
      data: null,
    },
    { status }
  )
}

export function apiUnauthorized(message = 'Unauthorized') {
  return apiError(message, 'E-GE401UN', 401)
}

export function apiForbidden(message = 'Forbidden') {
  return apiError(message, 'E-GE403FB', 403)
}
