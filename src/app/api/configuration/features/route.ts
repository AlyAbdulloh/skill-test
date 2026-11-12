import { NextRequest } from 'next/server'
import { ApprovalLineUsecase } from '@/modules/v1/server/configuration/approval-line/usecases/approval-line.usecase'

export async function GET(req: NextRequest) {
  const keywords = req.nextUrl.searchParams.get('keywords') || ''
  return ApprovalLineUsecase.getFeatures(keywords)
}
