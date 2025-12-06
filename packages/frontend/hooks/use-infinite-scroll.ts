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
    const element = loadMoreRef.current

    if (!element || !hasNextPage || isLoading) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && hasNextPage && !isLoading) {
          onLoadMore()
        }
      },
      {
        threshold,
        rootMargin: '100px', // Trigger 100px before the element comes into view
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [hasNextPage, isLoading, onLoadMore, threshold])

  return { loadMoreRef }
}
