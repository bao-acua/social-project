'use client'

import { useEffect, useRef } from 'react'

interface UseInfiniteScrollOptions {
  hasNextPage: boolean
  isLoading: boolean
  onLoadMore: () => void
  threshold?: number
}

export function useInfiniteScroll({
  hasNextPage,
  isLoading,
  onLoadMore,
  threshold = 0.1,
}: UseInfiniteScrollOptions) {
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isLoading) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isLoading) {
          onLoadMore()
        }
      },
      { threshold }
    )

    observer.observe(loadMoreRef.current)

    return () => {
      observer.disconnect()
    }
  }, [hasNextPage, isLoading, onLoadMore, threshold])

  return { loadMoreRef }
}
