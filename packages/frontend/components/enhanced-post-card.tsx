'use client'

import { useState } from 'react'
import relativeDate from 'tiny-relative-date'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { trpc } from '@/lib/trpc'
import { CommentSection } from '@/components/comment-section'
import type { PostResponse } from 'shared'

interface PostCardProps {
  post: PostResponse
  currentUserId?: string
  isAdmin?: boolean
}

export function EnhancedPostCard({ post, currentUserId, isAdmin }: PostCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [editError, setEditError] = useState('')
  const [showComments, setShowComments] = useState(false)

  const utils = trpc.useUtils()

  const updatePostMutation = trpc.posts.updatePost.useMutation({
    onSuccess: () => {
      utils.posts.getTimeline.invalidate()
      setEditDialogOpen(false)
      setEditError('')
    },
    onError: (err) => {
      setEditError(err.message || 'Failed to update post')
    },
  })

  const deletePostMutation = trpc.posts.deletePost.useMutation({
    onSuccess: () => {
      utils.posts.getTimeline.invalidate()
      setDeleteDialogOpen(false)
    },
  })

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    setEditError('')

    if (!editContent.trim()) {
      setEditError('Post content cannot be empty')
      return
    }

    if (editContent.length > 5000) {
      setEditError('Post content must be at most 5000 characters')
      return
    }

    updatePostMutation.mutate({
      id: post.id,
      content: editContent.trim(),
    })
  }

  const handleDelete = () => {
    deletePostMutation.mutate({ id: post.id })
  }

  if (!post.author) {
    return null
  }

  const isOwnPost = currentUserId === post.author.id
  console.log("🚀 ~ EnhancedPostCard ~ currentUserId:", currentUserId)
  console.log("🚀 ~ EnhancedPostCard ~ post.author.id:", post.author.id)
  const canEdit = isOwnPost || isAdmin
  const canDelete = isOwnPost || isAdmin
  const timeAgo = relativeDate(new Date(post.createdAt))

  return (
    <>
      <Card className={`mb-4 ${post.isDeleted ? 'opacity-70' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="" alt={post.author.fullName} />
                <AvatarFallback>{post.author.initials || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold">{post.author.fullName}</p>
                  {post.author.role === 'admin' && (
                    <Badge variant="default">Admin</Badge>
                  )}
                  {post.isDeleted && (
                    <Badge variant="destructive">Deleted</Badge>
                  )}
                  {post.isEdited && !post.isDeleted && (
                    <Badge variant="secondary">
                      {post.editedByAdmin ? 'Edited by admin' : 'Edited'}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  @{post.author.username} · {timeAgo}
                </p>
              </div>
            </div>
            {canEdit && !post.isDeleted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
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
        </CardHeader>
        <CardContent>
          <p className={`mb-4 whitespace-pre-wrap ${post.isDeleted ? 'line-through text-muted-foreground' : ''}`}>
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
                  {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
                </Button>
              </div>
              {showComments && <CommentSection postId={post.id} />}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Edit Post</DialogTitle>
              <DialogDescription>
                Make changes to your post
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  disabled={updatePostMutation.isPending}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{editContent.length} / 5000 characters</span>
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
                disabled={updatePostMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updatePostMutation.isPending}>
                {updatePostMutation.isPending ? 'Saving...' : 'Save Changes'}
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
              This action cannot be undone. This will permanently delete your post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePostMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletePostMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePostMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
