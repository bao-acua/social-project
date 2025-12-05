'use client'

import { Navbar } from '@/components/navbar'
import { useAuth } from '@/context/auth-context'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturesSection } from '@/components/home/features-section'
import { CTASection } from '@/components/home/cta-section'
import { PageFooter } from '@/components/home/page-footer'

export default function HomePage() {
  const { user } = useAuth()
  const isAuthenticated = !!user

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      <HeroSection isAuthenticated={isAuthenticated} />
      <FeaturesSection />
      {!isAuthenticated && <CTASection />}
      <PageFooter />
    </div>
  )
}
