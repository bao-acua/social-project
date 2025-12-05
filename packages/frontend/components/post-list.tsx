'use client'

import { forwardRef } from 'react'
import { EnhancedPostCard } from '@/components/enhanced-post-card'
import { Button } from '@/components/ui/button'
import { ErrorMessage } from '@/components/error-message'
import type { PostResponse } from 'shared'
import type { TRPCClientErrorLike } from '@trpc/client'
import type { AppRouter } from '@/lib/trpc'

interface PostListProps {
  posts: PostResponse[]
  isLoading: boolean
  error: TRPCClientErrorLike<AppRouter> | null
  hasNextPage: boolean
  isSearchMode: boolean
  currentUserId?: string
  isAdmin?: boolean
  onLoadMore: () => void
}

export const PostList = forwardRef<HTMLDivElement, PostListProps>(
  function PostList(
    {
      posts,
      isLoading,
      error,
      hasNextPage,
      isSearchMode,
      currentUserId,
      isAdmin,
      onLoadMore,
    },
    loadMoreRef
  ) {
    if (error) {
      return (
        <div className="mb-6">
          <ErrorMessage error={error} />
        </div>
      )
    }

    if (isLoading && posts.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {isSearchMode ? 'Searching posts...' : 'Loading posts...'}
          </p>
        </div>
      )
    }

    if (posts.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {isSearchMode
              ? 'No posts found matching your search.'
              : 'No posts yet. Be the first to post!'}
          </p>
        </div>
      )
    }

    return (
      <>
        <div>
          {posts.map((post) => (
            <EnhancedPostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
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
            <Button variant="outline" onClick={onLoadMore}>
              Load More
            </Button>
          </div>
        )}

        {!hasNextPage && posts.length > 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              {isSearchMode
                ? "You've reached the end of search results"
                : "You've reached the end of the timeline"}
            </p>
          </div>
        )}
      </>
    )
  }
)
