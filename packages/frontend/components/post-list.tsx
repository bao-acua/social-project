'use client'

import { forwardRef } from 'react'
import { EnhancedPostCard } from '@/components/enhanced-post-card'
import { ErrorMessage } from '@/components/error-message'
import type { PostResponse } from 'shared'
import type { TRPCClientErrorLike } from '@trpc/client'
import type { AppRouter } from '@/lib/trpc'

interface PostListProps {
  posts: PostResponse[]
  isLoading: boolean
  isFetchingMore?: boolean
  error: TRPCClientErrorLike<AppRouter> | null
  hasNextPage: boolean
  isSearchMode: boolean
  currentUserId?: string
  isAdmin?: boolean
  onLoadMore?: () => void
  onPostUpdated?: (updatedPost: Partial<PostResponse> & { id: string }) => void
  onPostDeleted?: (postId: string, isAdmin: boolean) => void
}

export const PostList = forwardRef<HTMLDivElement, PostListProps>(
  function PostList(
    {
      posts,
      isLoading,
      isFetchingMore = false,
      error,
      hasNextPage,
      isSearchMode,
      currentUserId,
      isAdmin,
      onPostUpdated,
      onPostDeleted,
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
              onPostUpdated={onPostUpdated}
              onPostDeleted={onPostDeleted}
            />
          ))}
        </div>

        {hasNextPage && (
          <div ref={loadMoreRef} className="mt-4 h-20 flex items-center justify-center">
            {isFetchingMore && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading more posts...</p>
              </div>
            )}
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
