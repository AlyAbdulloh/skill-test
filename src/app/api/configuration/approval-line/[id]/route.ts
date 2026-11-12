import { NextRequest } from 'next/server'
import { ApprovalLineUsecase } from '@/modules/v1/server/configuration/approval-line/usecases/approval-line.usecase'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return ApprovalLineUsecase.detail(parseInt(id))
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  return ApprovalLineUsecase.update(parseInt(id), body)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return ApprovalLineUsecase.delete(parseInt(id))
}
