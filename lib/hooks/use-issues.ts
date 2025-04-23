"use client"

import useSWR from "swr"
import { useState } from "react"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.")
    const data = await res.json()
    error.message = data.error || error.message
    throw error
  }
  return res.json()
}

export function useIssues(initialPage = 1, pageSize = 10, filters = {}) {
  const [page, setPage] = useState(initialPage)

  // Build query string
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  })

  // Add filters to query string
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value as string)
  })

  const { data, error, mutate, isLoading } = useSWR(`/api/issues?${params.toString()}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000, // 10 seconds
  })

  return {
    issues: data?.issues || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    isError: error,
    mutate,
    page,
    setPage,
  }
}
