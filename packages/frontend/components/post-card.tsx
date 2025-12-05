'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface Comment {
  id: string
  content: string
  author: {
    username: string
    fullName: string
    initials: string
  }
}

interface Post {
  id: string
  content: string
  author: {
    username: string
    fullName: string
    initials: string
  }
  comments: Comment[]
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="" alt={post.author.fullName} />
            <AvatarFallback>{post.author.initials || 'BA'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{post.author.fullName}</p>
            <p className="text-sm text-muted-foreground">
              @{post.author.username}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{post.content}</p>
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setShowComments(!showComments)}
          >
            {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
          </Button>
        </div>
        {showComments && (
          <div className="mt-4 space-y-4">
            <Separator />
            {post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={comment.author.fullName} />
                      <AvatarFallback>
                        {comment.author.initials || 'BA'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">
                        {comment.author.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{comment.author.username}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm ml-10">{comment.content}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No comments yet</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
