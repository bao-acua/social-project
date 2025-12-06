'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  const isFetchingRef = useRef(false)

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
          isFetchingRef.current = false
          return data.posts
        }
        const newPosts = data.posts.filter(
          post => !prev.some(p => p.id === post.id)
        )
        setIsFetchingMore(false)
        isFetchingRef.current = false
        return [...prev, ...newPosts]
      })
    }
  }, [data, offset])

  const hasNextPage = data ? (offset + POSTS_PER_PAGE) < data.pagination.total : false

  const fetchNextPage = useCallback(() => {
    // Prevent duplicate requests
    if (isFetchingRef.current) return

    const currentData = isSearchMode ? searchData : timelineData
    const currentHasNextPage = currentData ? (offset + POSTS_PER_PAGE) < currentData.pagination.total : false

    if (!currentHasNextPage) return

    isFetchingRef.current = true
    setIsFetchingMore(true)
    setOffset(prev => prev + POSTS_PER_PAGE)
  }, [offset, isSearchMode, searchData, timelineData])

  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setSearchQuery('')
    setIsSearchMode(false)
    setOffset(0)
    setAllPosts([])
  }, [])

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
  }, [searchInput, handleClearSearch])

  const handlePostCreated = useCallback(() => {
    if (!isSearchMode) {
      setOffset(0)
      setAllPosts([])
    }
  }, [isSearchMode])

  const handleSearchInputChange = useCallback((value: string) => {
    setSearchInput(value)
  }, [])

  const handlePostUpdated = useCallback((updatedPost: Partial<PostResponse> & { id: string }) => {
    setAllPosts(prev =>
      prev.map(post =>
        post.id === updatedPost.id
          ? { ...post, ...updatedPost }
          : post
      )
    )
  }, [])

  const handlePostDeleted = useCallback((postId: string, isAdmin: boolean) => {
    setAllPosts(prev => {
      if (isAdmin) {
        // Admin: mark as deleted
        return prev.map(post =>
          post.id === postId
            ? { ...post, isDeleted: true, deletedAt: new Date() }
            : post
        )
      } else {
        // User: remove from list
        return prev.filter(post => post.id !== postId)
      }
    })
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
    handlePostUpdated,
    handlePostDeleted,
    handleSearchInputChange,
  }
}
