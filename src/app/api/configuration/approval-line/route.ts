import { NextRequest } from 'next/server'
import { ApprovalLineUsecase } from '@/modules/v1/server/configuration/approval-line/usecases/approval-line.usecase'

export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
  const perPage = parseInt(req.nextUrl.searchParams.get('per_page') || '20')
  const keywords = req.nextUrl.searchParams.get('keywords') || ''
  const featureId = req.nextUrl.searchParams.get('feature_id')
  return ApprovalLineUsecase.list(page, perPage, keywords, featureId ? parseInt(featureId) : undefined)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  return ApprovalLineUsecase.create(body)
}
