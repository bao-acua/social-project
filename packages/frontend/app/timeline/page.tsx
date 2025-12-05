'use client'

import { Navbar } from '@/components/navbar'
import { ProtectedRoute } from '@/components/protected-route'
import { PostCard } from '@/components/post-card'

const mockPosts = [
  {
    id: '1',
    content: 'Just finished reading an amazing book! Highly recommend it to everyone.',
    author: {
      username: 'johndoe',
      fullName: 'John Doe',
    },
    comments: [
      {
        id: '1',
        content: 'What book was it? I would love to check it out!',
        author: {
          username: 'janedoe',
          fullName: 'Jane Doe',
        },
      },
      {
        id: '2',
        content: 'I agree, it was a great read!',
        author: {
          username: 'bobsmith',
          fullName: 'Bob Smith',
        },
      },
    ],
  },
  {
    id: '2',
    content: 'Beautiful sunset today! Nature never fails to amaze me.',
    author: {
      username: 'alicejohnson',
      fullName: 'Alice Johnson',
    },
    comments: [
      {
        id: '3',
        content: 'Stunning! Where was this taken?',
        author: {
          username: 'charliebrown',
          fullName: 'Charlie Brown',
        },
      },
    ],
  },
  {
    id: '3',
    content: 'Working on a new project. Excited to share it with you all soon!',
    author: {
      username: 'davemiller',
      fullName: 'Dave Miller',
    },
    comments: [],
  },
]

export default function TimelinePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Timeline</h1>
            <div>
              {mockPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

