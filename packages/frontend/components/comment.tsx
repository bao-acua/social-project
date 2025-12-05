'use client'

import { useState } from 'react'
import relativeDate from 'tiny-relative-date'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { trpc } from '@/lib/trpc'
import type { CommentResponse } from 'shared'
import { useAuth } from '@/context/auth-context'

interface CommentProps {
  comment: CommentResponse
  postId: string
  onCommentUpdated?: () => void
}

export function Comment({ comment, postId, onCommentUpdated }: CommentProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [editError, setEditError] = useState('')

  const { user } = useAuth()
  const utils = trpc.useUtils()

  const updateCommentMutation = trpc.comments.updateComment.useMutation({
    onSuccess: () => {
      utils.comments.getCommentsByPost.invalidate({ postId })
      utils.posts.getTimeline.invalidate()
      setEditDialogOpen(false)
      setEditError('')
      onCommentUpdated?.()
    },
    onError: (err) => {
      setEditError(err.message || 'Failed to update comment')
    },
  })

  const deleteCommentMutation = trpc.comments.deleteComment.useMutation({
    onSuccess: () => {
      utils.comments.getCommentsByPost.invalidate({ postId })
      utils.posts.getTimeline.invalidate()
      setDeleteDialogOpen(false)
      onCommentUpdated?.()
    },
  })

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    setEditError('')

    if (!editContent.trim()) {
      setEditError('Comment cannot be empty')
      return
    }

    if (editContent.length > 2000) {
      setEditError('Comment must be at most 2000 characters')
      return
    }

    updateCommentMutation.mutate({
      id: comment.id,
      content: editContent.trim(),
    })
  }

  const handleDelete = () => {
    deleteCommentMutation.mutate({ id: comment.id })
  }

  const isOwnComment = user?.userId === comment.author.id
  const isAdmin = user?.role === 'admin'
  const canEdit = isOwnComment || isAdmin
  const canDelete = isOwnComment || isAdmin
  const timeAgo = relativeDate(new Date(comment.createdAt))

  return (
    <>
      <div className={`flex gap-3 pl-4 ${comment.isDeleted ? 'opacity-70' : ''}`}>
        <Avatar className="w-8 h-8">
          <AvatarImage src="" alt={comment.author.fullName} />
          <AvatarFallback className="text-xs">
            {comment.author.initials || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold">{comment.author.fullName}</span>
              {comment.author.role === 'admin' && (
                <Badge variant="default" className="text-xs py-0">Admin</Badge>
              )}
              {comment.isDeleted && (
                <Badge variant="destructive" className="text-xs py-0">Deleted</Badge>
              )}
              {comment.isEdited && !comment.isDeleted && (
                <Badge variant="secondary" className="text-xs py-0">
                  {comment.editedByAdmin ? 'Edited by admin' : 'Edited'}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {timeAgo}
                {comment.isEdited && comment.editedAt && !comment.isDeleted && (
                  <> · Updated {relativeDate(new Date(comment.editedAt))}</>
                )}
              </span>
            </div>
            {canEdit && !comment.isDeleted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    ⋮
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && (
                    <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                      Edit
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <p className={`text-sm whitespace-pre-wrap ${comment.isDeleted ? 'line-through text-muted-foreground' : ''}`}>
            {comment.content}
          </p>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Edit Comment</DialogTitle>
              <DialogDescription>
                Make changes to your comment
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-comment-content">Content</Label>
                <Textarea
                  id="edit-comment-content"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                  disabled={updateCommentMutation.isPending}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{editContent.length} / 2000 characters</span>
                </div>
                {editError && (
                  <p className="text-sm font-medium text-destructive">{editError}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={updateCommentMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateCommentMutation.isPending}>
                {updateCommentMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCommentMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteCommentMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCommentMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
