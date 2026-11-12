'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import type { ApprovalLineList } from '../../domains/approval-line.list'
import { ApprovalLineRepository } from '../../repositories/approval-line.repository'

export function useApprovalLineTable() {
  const [pageData, setPageData] = useState<ApprovalLineList | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  const fetchData = useCallback(async (q: string, p: number) => {
    setLoading(true)
    try {
      const data = await ApprovalLineRepository.getAll(p, 20, q)
      setPageData(data)
    } catch {
      toast.error('Failed to load approval lines')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData(debouncedSearch, page) }, [fetchData, debouncedSearch, page])

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 300)
    return () => clearTimeout(timer)
  }, [search])

  async function handleDelete(id: number) {
    try {
      await ApprovalLineRepository.delete(id)
      toast.success('Approval line deleted')
      fetchData(debouncedSearch, page)
    } catch {
      toast.error('Failed to delete approval line')
    }
  }

  async function handleCreate(payload: any) {
    try {
      await ApprovalLineRepository.create(payload)
      toast.success('Approval line created')
      fetchData(debouncedSearch, page)
      return true
    } catch {
      toast.error('Failed to create approval line')
      return false
    }
  }

  async function handleUpdate(id: number, payload: any) {
    try {
      await ApprovalLineRepository.update(id, payload)
      toast.success('Approval line updated')
      fetchData(debouncedSearch, page)
      return true
    } catch {
      toast.error('Failed to update approval line')
      return false
    }
  }

  return {
    pageData,
    loading,
    search,
    setSearch,
    page,
    setPage,
    fetchData: () => fetchData(debouncedSearch, page),
    handleDelete,
    handleCreate,
    handleUpdate,
  }
}
