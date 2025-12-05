'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'

function Loading() {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    </>
  )
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return Loading();
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

