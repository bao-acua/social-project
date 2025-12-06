import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface HeroSectionProps {
  isAuthenticated: boolean
}

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  return (
    <section className="container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24" data-ci="hero-section">
      <div className="max-w-5xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight" data-ci="hero-title">
          Connect, Share, and
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {' '}Inspire
          </span>
        </h1>

        <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed" data-ci="hero-description">
          Join our vibrant community where you can share your stories, connect with like-minded people, and discover amazing content every day.
        </p>

        {!isAuthenticated && (
          <div className="pt-4" data-ci="hero-guest-actions">
            <div className="flex gap-4 justify-center items-center flex-wrap">
              <Link href="/register">
                <Button size="lg" data-ci="hero-register-button">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" data-ci="hero-login-button">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}

        {isAuthenticated && (
          <div className="pt-4" data-ci="hero-authenticated-actions">
            <Link href="/timeline">
              <Button size="lg" className="text-lg px-8 py-6" data-ci="hero-timeline-button">
                Go to Timeline
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
