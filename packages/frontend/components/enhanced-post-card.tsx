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
}

export function EnhancedPostCard({ post, currentUserId, isAdmin }: PostCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const utils = trpc.useUtils()

  const updatePostMutation = trpc.posts.updatePost.useMutation({
    onSuccess: () => {
      utils.posts.getTimeline.invalidate()
      setEditDialogOpen(false)
    },
  })

  const deletePostMutation = trpc.posts.deletePost.useMutation({
    onSuccess: () => {
      utils.posts.getTimeline.invalidate()
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
  const canEdit = isOwnPost || isAdmin
  const canDelete = isOwnPost || isAdmin

  return (
    <>
      <Card className={`mb-4 ${post.isDeleted ? 'opacity-70' : ''}`}>
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
            className={`mb-4 whitespace-pre-wrap ${
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
