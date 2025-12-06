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
  const onLoadMoreRef = useRef(onLoadMore)

  // Keep the callback ref updated
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  useEffect(() => {
    // Wait for the element to be available in the DOM
    // This is necessary because the element is conditionally rendered
    const checkAndObserve = () => {
      const element = loadMoreRef.current

      if (!element || !hasNextPage || isLoading) {
        return null
      }

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          if (entry?.isIntersecting && hasNextPage && !isLoading) {
            onLoadMoreRef.current()
          }
        },
        {
          threshold,
          rootMargin: '100px', // Trigger 100px before the element comes into view
        }
      )

      observer.observe(element)
      return observer
    }

    // Try immediately
    let observer = checkAndObserve()

    // If no element yet, retry after a short delay to let React attach the ref
    const timeoutId = !observer && hasNextPage && !isLoading
      ? setTimeout(() => {
          observer = checkAndObserve()
        }, 100)
      : undefined

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (observer) observer.disconnect()
    }
  }, [hasNextPage, isLoading, threshold])

  return { loadMoreRef }
}
