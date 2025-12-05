'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface CreatePostDialogProps {
  onPostCreated?: () => void
}

export function CreatePostDialog({ onPostCreated }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  const utils = trpc.useUtils()

  const createPostMutation = trpc.posts.createPost.useMutation({
    onSuccess: () => {
      utils.posts.getTimeline.invalidate()
      setContent('')
      setError('')
      setOpen(false)
      onPostCreated?.()
    },
    onError: (err) => {
      setError(err.message || 'Failed to create post')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!content.trim()) {
      setError('Post content cannot be empty')
      return
    }

    if (content.length > 5000) {
      setError('Post content must be at most 5000 characters')
      return
    }

    createPostMutation.mutate({ content: content.trim() })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Post</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a new post</DialogTitle>
            <DialogDescription>
              Share your thoughts with the community
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                disabled={createPostMutation.isPending}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{content.length} / 5000 characters</span>
              </div>
              {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createPostMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createPostMutation.isPending}>
              {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
