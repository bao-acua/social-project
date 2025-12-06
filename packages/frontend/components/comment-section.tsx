'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Comment } from '@/components/comment'
import type { CommentResponse } from 'shared'

const COMMENTS_PER_PAGE = 10

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [offset, setOffset] = useState(0)
  const [allComments, setAllComments] = useState<CommentResponse[]>([])
  const [error, setError] = useState('')

  const utils = trpc.useUtils()

  const {
    data,
    isLoading,
    error: fetchError,
  } = trpc.comments.getCommentsByPost.useQuery(
    {
      postId,
      limit: COMMENTS_PER_PAGE,
      offset,
    },
    {
      refetchOnWindowFocus: false,
    }
  )

  const createCommentMutation = trpc.comments.createComment.useMutation({
    onSuccess: (result) => {
      setNewComment('')
      setError('')
      // Don't reset - just add the new comment to the top
      setAllComments(prev => [result.comment, ...prev])
      // Only invalidate to update counts, not refetch all comments
      utils.posts.getTimeline.invalidate()
    },
    onError: (err) => {
      setError(err.message || 'Failed to create comment')
    },
  })

  useEffect(() => {
    if (data?.comments) {
      setAllComments(prev => {
        if (offset === 0) {
          return data.comments
        }
        const newComments = data.comments.filter(
          comment => !prev.some(c => c.id === comment.id)
        )
        return [...prev, ...newComments]
      })
    }
  }, [data, offset])

  const hasMore = data ? (offset + COMMENTS_PER_PAGE) < data.pagination.total : false

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!newComment.trim()) {
      setError('Comment cannot be empty')
      return
    }

    if (newComment.length > 2000) {
      setError('Comment must be at most 2000 characters')
      return
    }

    createCommentMutation.mutate({
      postId,
      content: newComment.trim(),
      parentCommentId: null,
    })
  }

  const loadMoreComments = () => {
    if (hasMore) {
      setOffset(prev => prev + COMMENTS_PER_PAGE)
    }
  }

  if (fetchError) {
    return (
      <div className="mt-4 p-4 border-t">
        <p className="text-sm text-destructive">Failed to load comments</p>
      </div>
    )
  }

  return (
    <div className="mt-4 pt-4 border-t space-y-4">
      {/* Create Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Label htmlFor={`comment-${postId}`}>Add a comment</Label>
        <Textarea
          id={`comment-${postId}`}
          placeholder="Write your comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          disabled={createCommentMutation.isPending}
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {newComment.length} / 2000 characters
          </span>
          <Button
            type="submit"
            size="sm"
            disabled={createCommentMutation.isPending || !newComment.trim()}
          >
            {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </form>

      {/* Comments List */}
      {isLoading && allComments.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Loading comments...</p>
        </div>
      ) : allComments.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to comment!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allComments.map((comment, index) => (
            <div
              key={comment.id}
              className="animate-in fade-in slide-in-from-top-2 duration-300"
              style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
            >
              <Comment
                comment={comment}
                postId={postId}
                onCommentUpdated={() => {
                  setOffset(0)
                  setAllComments([])
                  utils.comments.getCommentsByPost.invalidate({ postId })
                }}
              />
            </div>
          ))}

          {hasMore && (
            <div className="text-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMoreComments}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More Comments'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
