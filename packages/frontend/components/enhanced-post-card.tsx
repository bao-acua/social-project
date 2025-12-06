'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { trpc } from '@/lib/trpc'
import { CommentSection } from '@/components/comment-section'
import { PostHeader } from '@/components/post-card/post-header'
import { PostActionsMenu } from '@/components/post-card/post-actions-menu'
import { EditPostDialog } from '@/components/post-card/edit-post-dialog'
import { DeletePostDialog } from '@/components/post-card/delete-post-dialog'
import type { PostResponse } from 'shared'

interface PostCardProps {
  post: PostResponse
  currentUserId?: string
  isAdmin?: boolean
  onPostUpdated?: (updatedPost: Partial<PostResponse> & { id: string }) => void
  onPostDeleted?: (postId: string, isAdmin: boolean) => void
}

export function EnhancedPostCard({
  post,
  currentUserId,
  isAdmin,
  onPostUpdated,
  onPostDeleted
}: PostCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const utils = trpc.useUtils()

  const updatePostMutation = trpc.posts.updatePost.useMutation({
    onMutate: async (variables) => {
      await utils.posts.getTimeline.cancel()
      await utils.posts.searchPosts.cancel()

      const previousData: Array<{ type: string; data: unknown }> = []

      const updatedPostData = {
        id: variables.id,
        content: variables.content,
        isEdited: true,
        editedAt: new Date(),
        editedByAdmin: isAdmin && post.author?.id !== currentUserId,
      }

      onPostUpdated?.(updatedPostData)

      utils.posts.getTimeline.setQueriesData({}, (old) => {
        if (!old) return old
        previousData.push({ type: 'timeline', data: old })
        return {
          ...old,
          posts: old.posts.map((p) =>
            p.id === variables.id
              ? { ...p, ...updatedPostData }
              : p
          ),
        }
      })

      // Update all search queries with optimistic data
      utils.posts.searchPosts.setQueriesData({}, (old) => {
        if (!old) return old
        previousData.push({ type: 'search', data: old })
        return {
          ...old,
          posts: old.posts.map((p) =>
            p.id === variables.id
              ? { ...p, ...updatedPostData }
              : p
          ),
        }
      })

      return { previousData }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(({ type, data }) => {
          if (type === 'timeline') {
            utils.posts.getTimeline.setQueriesData({}, data)
          } else if (type === 'search') {
            utils.posts.searchPosts.setQueriesData({}, data)
          }
        })
      }
    },
    onSuccess: () => {
      setEditDialogOpen(false)
    },
  })

  const deletePostMutation = trpc.posts.deletePost.useMutation({
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await utils.posts.getTimeline.cancel()
      await utils.posts.searchPosts.cancel()

      // Snapshot previous values
      const previousData: Array<{ type: string; data: unknown }> = []

      // Update local state immediately
      onPostDeleted?.(variables.id, isAdmin || false)

      // Optimistically update all timeline queries (mark as deleted for admin, remove for users)
      utils.posts.getTimeline.setQueriesData({}, (old) => {
        if (!old) return old
        previousData.push({ type: 'timeline', data: old })
        return {
          ...old,
          posts: isAdmin
            ? old.posts.map((p) =>
                p.id === variables.id
                  ? { ...p, isDeleted: true, deletedAt: new Date() }
                  : p
              )
            : old.posts.filter((p) => p.id !== variables.id),
          pagination: {
            ...old.pagination,
            total: isAdmin ? old.pagination.total : old.pagination.total - 1,
          },
        }
      })

      // Optimistically update all search queries
      utils.posts.searchPosts.setQueriesData({}, (old) => {
        if (!old) return old
        previousData.push({ type: 'search', data: old })
        return {
          ...old,
          posts: isAdmin
            ? old.posts.map((p) =>
                p.id === variables.id
                  ? { ...p, isDeleted: true, deletedAt: new Date() }
                  : p
              )
            : old.posts.filter((p) => p.id !== variables.id),
          pagination: {
            ...old.pagination,
            total: isAdmin ? old.pagination.total : old.pagination.total - 1,
          },
        }
      })

      return { previousData }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(({ type, data }) => {
          if (type === 'timeline') {
            utils.posts.getTimeline.setQueriesData({}, data)
          } else if (type === 'search') {
            utils.posts.searchPosts.setQueriesData({}, data)
          }
        })
      }
    },
    onSuccess: () => {
      setDeleteDialogOpen(false)
    },
  })

  const handleSaveEdit = (content: string) => {
    updatePostMutation.mutate({
      id: post.id,
      content,
    })
  }

  const handleDelete = () => {
    deletePostMutation.mutate({ id: post.id })
  }

  if (!post.author) {
    return null
  }

  const isOwnPost = currentUserId === post.author.id
  const canEdit = !!(isOwnPost || isAdmin)
  const canDelete = !!(isOwnPost || isAdmin)

  return (
    <>
      <Card className={`mb-4 transition-all duration-300 ease-in-out ${post.isDeleted ? 'opacity-70 scale-[0.99]' : 'opacity-100 scale-100'}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <PostHeader
              author={post.author}
              createdAt={post.createdAt}
              isDeleted={post.isDeleted}
              isEdited={post.isEdited}
              editedByAdmin={post.editedByAdmin}
            />
            {!post.isDeleted && (
              <PostActionsMenu
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={() => setEditDialogOpen(true)}
                onDelete={() => setDeleteDialogOpen(true)}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p
            className={`mb-4 whitespace-pre-wrap transition-all duration-200 ${
              post.isDeleted ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {post.content}
          </p>
          {!post.isDeleted && (
            <>
              <Separator className="my-4" />
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                >
                  {post.commentsCount}{' '}
                  {post.commentsCount === 1 ? 'comment' : 'comments'}
                </Button>
              </div>
              {showComments && <CommentSection postId={post.id} />}
            </>
          )}
        </CardContent>
      </Card>

      <EditPostDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        initialContent={post.content}
        onSave={handleSaveEdit}
        isLoading={updatePostMutation.isPending}
      />

      <DeletePostDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isLoading={deletePostMutation.isPending}
      />
    </>
  )
}
