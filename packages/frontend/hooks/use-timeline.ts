'use client'

import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc'
import type { PostResponse } from 'shared'

const POSTS_PER_PAGE = 20

interface UseTimelineOptions {
  userRole?: 'user' | 'admin'
}

export function useTimeline({ userRole }: UseTimelineOptions) {
  const [offset, setOffset] = useState(0)
  const [allPosts, setAllPosts] = useState<PostResponse[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  // Timeline query
  const {
    data: timelineData,
    isLoading: isTimelineLoading,
    error: timelineError,
  } = trpc.posts.getTimeline.useQuery(
    {
      limit: String(POSTS_PER_PAGE),
      offset: String(offset),
      includeDeleted: userRole === 'admin' ? 'true' : 'false',
    },
    {
      refetchOnWindowFocus: false,
      enabled: !isSearchMode,
    }
  )

  // Search query
  const {
    data: searchData,
    isLoading: isSearchLoading,
    error: searchError,
  } = trpc.posts.searchPosts.useQuery(
    {
      query: searchQuery,
      limit: String(POSTS_PER_PAGE),
      offset: String(offset),
      includeDeleted: userRole === 'admin' ? 'true' : 'false',
    },
    {
      refetchOnWindowFocus: false,
      enabled: isSearchMode && searchQuery.length > 0,
    }
  )

  // Get current data based on mode
  const data = isSearchMode ? searchData : timelineData
  const isLoading = isSearchMode ? isSearchLoading : isTimelineLoading
  const error = isSearchMode ? searchError : timelineError

  // Update posts when data changes
  useEffect(() => {
    if (data?.posts) {
      setAllPosts(prev => {
        if (offset === 0) {
          setIsFetchingMore(false)
          return data.posts
        }
        const newPosts = data.posts.filter(
          post => !prev.some(p => p.id === post.id)
        )
        setIsFetchingMore(false)
        return [...prev, ...newPosts]
      })
    }
  }, [data, offset])

  const hasNextPage = data ? (offset + POSTS_PER_PAGE) < data.pagination.total : false

  const fetchNextPage = useCallback(() => {
    if (!hasNextPage || isFetchingMore) return
    setIsFetchingMore(true)
    setOffset(prev => prev + POSTS_PER_PAGE)
  }, [hasNextPage, isFetchingMore])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim().length === 0) {
      handleClearSearch()
      return
    }
    setSearchQuery(searchInput.trim())
    setIsSearchMode(true)
    setOffset(0)
    setAllPosts([])
  }, [searchInput])

  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setSearchQuery('')
    setIsSearchMode(false)
    setOffset(0)
    setAllPosts([])
  }, [])

  const handlePostCreated = useCallback(() => {
    if (!isSearchMode) {
      setOffset(0)
      setAllPosts([])
    }
  }, [isSearchMode])

  const handleSearchInputChange = useCallback((value: string) => {
    setSearchInput(value)
  }, [])

  return {
    posts: allPosts,
    isLoading,
    isFetchingMore,
    error,
    hasNextPage,
    isSearchMode,
    searchQuery,
    searchInput,

    fetchNextPage,
    handleSearch,
    handleClearSearch,
    handlePostCreated,
    handleSearchInputChange,
  }
}
