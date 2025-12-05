'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`
}

interface Post {
  id: string
  content: string
  author: {
    id: string
    username: string
    fullName: string
    initials: string
    role: 'user' | 'admin'
  } | null
  isDeleted: boolean
  isEdited: boolean
  editedAt: Date | null
  editedByAdmin: boolean
  createdAt: Date
  updatedAt: Date
  commentsCount: number
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  if (post.isDeleted) {
    return (
      <Card className="mb-4 opacity-60">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground italic">
            This post has been deleted
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!post.author) {
    return null
  }

  const timeAgo = formatTimeAgo(new Date(post.createdAt))

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="" alt={post.author.fullName} />
            <AvatarFallback>{post.author.initials || 'BA'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold">{post.author.fullName}</p>
              {post.author.role === 'admin' && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                  Admin
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              @{post.author.username} · {timeAgo}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
            {post.isEdited && (
              <p className="text-xs text-muted-foreground mb-4">
                {post.editedByAdmin ? 'Edited by admin' : 'Edited'} {post.editedAt && formatTimeAgo(new Date(post.editedAt))}
              </p>
            )}
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <Button variant="ghost" disabled>
            {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
