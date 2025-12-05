'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Navbar } from '@/components/navbar'
import { ProtectedRoute } from '@/components/protected-route'
import { EnhancedPostCard } from '@/components/enhanced-post-card'
import { CreatePostDialog } from '@/components/create-post-dialog'
import { trpc } from '@/lib/trpc'
import { ErrorMessage } from '@/components/error-message'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import type { PostResponse } from 'shared'

const POSTS_PER_PAGE = 20

export default function TimelinePage() {
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const [allPosts, setAllPosts] = useState<PostResponse[]>([])
  const { user } = useAuth()

  const {
    data,
    isLoading,
    error,
  } = trpc.posts.getTimeline.useQuery(
    {
      limit: String(POSTS_PER_PAGE),
      offset: String(offset),
      includeDeleted: user?.role === 'admin' ? 'true' : 'false',
    },
    {
      refetchOnWindowFocus: false,
    }
  )

  useEffect(() => {
    if (data?.posts) {
      setAllPosts(prev => {
        if (offset === 0) {
          return data.posts
        }
        const newPosts = data.posts.filter(
          post => !prev.some(p => p.id === post.id)
        )
        return [...prev, ...newPosts]
      })
    }
  }, [data, offset])

  const hasNextPage = data ? (offset + POSTS_PER_PAGE) < data.pagination.total : false

  const fetchNextPage = useCallback(() => {
    if (!hasNextPage) return
    setOffset(prev => prev + POSTS_PER_PAGE)
  }, [hasNextPage])

  const handlePostCreated = () => {
    setOffset(0)
    setAllPosts([])
  }

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isLoading) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isLoading) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)

    return () => {
      observer.disconnect()
    }
  }, [hasNextPage, isLoading, fetchNextPage])

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Timeline</h1>
              <CreatePostDialog onPostCreated={handlePostCreated} />
            </div>

            {error && (
              <div className="mb-6">
                <ErrorMessage error={error} />
              </div>
            )}

            {isLoading && allPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading posts...</p>
              </div>
            ) : allPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
              </div>
            ) : (
              <>
                <div>
                  {allPosts.map((post) => (
                    <EnhancedPostCard
                      key={post.id}
                      post={post}
                      currentUserId={user?.id}
                      isAdmin={user?.role === 'admin'}
                    />
                  ))}
                </div>

                <div ref={loadMoreRef} className="mt-4">
                  {isLoading && (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">Loading more posts...</p>
                    </div>
                  )}
                </div>

                {hasNextPage && !isLoading && (
                  <div className="text-center mt-4">
                    <Button
                      variant="outline"
                      onClick={() => fetchNextPage()}
                    >
                      Load More
                    </Button>
                  </div>
                )}

                {!hasNextPage && allPosts.length > 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      You&apos;ve reached the end of the timeline
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

