import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface HeroSectionProps {
  isAuthenticated: boolean
}

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  return (
    <section className="container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24">
      <div className="max-w-5xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
          Connect, Share, and
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {' '}Inspire
          </span>
        </h1>

        <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Join our vibrant community where you can share your stories, connect with like-minded people, and discover amazing content every day.
        </p>

        {!isAuthenticated && (
          <div className="pt-4">
            <div className="flex gap-4 justify-center items-center flex-wrap">
              <Link href="/register">
                <Button size="lg">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • Free forever
            </p>
          </div>
        )}

        {isAuthenticated && (
          <div className="pt-4">
            <Link href="/timeline">
              <Button size="lg" className="text-lg px-8 py-6">
                Go to Timeline
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
