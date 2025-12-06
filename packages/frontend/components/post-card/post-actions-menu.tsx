import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface PostActionsMenuProps {
  canEdit: boolean
  canDelete: boolean
  onEdit: () => void
  onDelete: () => void
}

export function PostActionsMenu({
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: PostActionsMenuProps) {
  if (!canEdit && !canDelete) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" data-ci="post-actions-menu-trigger">
          ⋮
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canEdit && (
          <DropdownMenuItem onClick={onEdit} data-ci="post-edit-button">Edit</DropdownMenuItem>
        )}
        {canDelete && (
          <DropdownMenuItem onClick={onDelete} className="text-destructive" data-ci="post-delete-button">
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
