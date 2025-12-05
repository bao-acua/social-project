'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  searchInput: string
  searchQuery: string
  isSearchMode: boolean
  onSearchInputChange: (value: string) => void
  onSearch: (e: React.FormEvent) => void
  onClearSearch: () => void
}

export function SearchBar({
  searchInput,
  searchQuery,
  isSearchMode,
  onSearchInputChange,
  onSearch,
  onClearSearch,
}: SearchBarProps) {
  return (
    <form onSubmit={onSearch} className="mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search posts by content or author name..."
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchInput && (
          <button
            type="button"
            onClick={onClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {isSearchMode && (
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Searching for: <span className="font-medium text-foreground">{searchQuery}</span>
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearSearch}
          >
            Clear Search
          </Button>
        </div>
      )}
    </form>
  )
}
