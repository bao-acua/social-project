import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface EditPostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialContent: string
  onSave: (content: string) => void
  isLoading: boolean
}

const MAX_CONTENT_LENGTH = 5000

export function EditPostDialog({
  open,
  onOpenChange,
  initialContent,
  onSave,
  isLoading,
}: EditPostDialogProps) {
  const [content, setContent] = useState(initialContent)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedContent = content.trim()

    if (!trimmedContent) {
      setError('Post content cannot be empty')
      return
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      setError(`Post content must be at most ${MAX_CONTENT_LENGTH} characters`)
      return
    }

    onSave(trimmedContent)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setContent(initialContent)
      setError('')
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>Make changes to your post</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                disabled={isLoading}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {content.length} / {MAX_CONTENT_LENGTH} characters
                </span>
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
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
