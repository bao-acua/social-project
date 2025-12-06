'use client'

import { Navbar } from '@/components/navbar'
import { ProtectedRoute } from '@/components/protected-route'
import { CreatePostDialog } from '@/components/create-post-dialog'
import { SearchBar } from '@/components/search-bar'
import { PostList } from '@/components/post-list'
import { useAuth } from '@/context/auth-context'
import { useTimeline } from '@/hooks/use-timeline'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'

export default function TimelinePage() {
  const { user } = useAuth()

  const {
    posts,
    isLoading,
    isFetchingMore,
    error,
    hasNextPage,
    isSearchMode,
    searchQuery,
    searchInput,
    fetchNextPage,
    handleSearch,
    handleClearSearch,
    handlePostCreated,
    handleSearchInputChange,
  } = useTimeline({ userRole: user?.role })

  const { loadMoreRef } = useInfiniteScroll({
    hasNextPage,
    isLoading: isFetchingMore,
    onLoadMore: fetchNextPage,
  })

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Timeline</h1>
              <CreatePostDialog onPostCreated={handlePostCreated} />
            </div>

            <SearchBar
              searchInput={searchInput}
              searchQuery={searchQuery}
              isSearchMode={isSearchMode}
              onSearchInputChange={handleSearchInputChange}
              onSearch={handleSearch}
              onClearSearch={handleClearSearch}
            />

            <PostList
              ref={loadMoreRef}
              posts={posts}
              isLoading={isLoading}
              isFetchingMore={isFetchingMore}
              error={error}
              hasNextPage={hasNextPage}
              isSearchMode={isSearchMode}
              currentUserId={user?.id}
              isAdmin={user?.role === 'admin'}
              onLoadMore={fetchNextPage}
            />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
