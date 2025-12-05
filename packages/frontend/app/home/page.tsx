'use client'

import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'

function CenterButton() {
  return (
    <div className="flex gap-4 justify-center">
    <Link href="/login">
      <Button>Sign In</Button>
    </Link>
    <Link href="/register">
      <Button variant="outline">Sign Up</Button>
    </Link>
  </div>
  )
}

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to Social Project</h1>
          <p className="text-xl text-muted-foreground mb-12">
            Connect with friends and share your thoughts
          </p>
          { !user && <CenterButton /> }
        </div>
      </main>
    </div>
  )
}

