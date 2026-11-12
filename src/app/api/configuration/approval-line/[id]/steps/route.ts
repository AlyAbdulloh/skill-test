import { NextRequest } from 'next/server'
import { ApprovalLineUsecase } from '@/modules/v1/server/configuration/approval-line/usecases/approval-line.usecase'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return ApprovalLineUsecase.getSteps(parseInt(id))
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  return ApprovalLineUsecase.syncSteps(parseInt(id), body.steps)
}
