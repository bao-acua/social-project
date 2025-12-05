import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import relativeDate from 'tiny-relative-date'
import type { PostResponse } from 'shared'

interface PostHeaderProps {
  author: PostResponse['author']
  createdAt: Date
  isDeleted: boolean
  isEdited: boolean
  editedByAdmin: boolean
}

export function PostHeader({
  author,
  createdAt,
  isDeleted,
  isEdited,
  editedByAdmin,
}: PostHeaderProps) {
  if (!author) return null

  const timeAgo = relativeDate(new Date(createdAt))

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src="" alt={author.fullName} />
        <AvatarFallback>{author.initials || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold">{author.fullName}</p>
          {author.role === 'admin' && <Badge variant="default">Admin</Badge>}
          {isDeleted && <Badge variant="destructive">Deleted</Badge>}
          {isEdited && !isDeleted && (
            <Badge variant="secondary">
              {editedByAdmin ? 'Edited by admin' : 'Edited'}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          @{author.username} · {timeAgo}
        </p>
      </div>
    </div>
  )
}
