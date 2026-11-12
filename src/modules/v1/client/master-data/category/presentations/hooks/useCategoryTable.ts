'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CategoryList } from '../../domains/category.list'
import { CategoryRepository } from '../../repositories/category.repository'

export function useCategoryTable() {
  const [data, setData] = useState<CategoryList | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [keywords, setKeywords] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await CategoryRepository.getAll(page, 20, keywords)
      setData(res)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [page, keywords])

  useEffect(() => { fetchData() }, [fetchData])

  return { data, loading, page, setPage, keywords, setKeywords, refetch: fetchData }
}
