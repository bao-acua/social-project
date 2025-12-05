import { MessageSquare, Users, Heart, Zap, Shield, TrendingUp, LucideIcon } from 'lucide-react'

export interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

export const FEATURES: Feature[] = [
  {
    icon: MessageSquare,
    title: 'Share Your Thoughts',
    description: 'Post updates, share moments, and express yourself with our intuitive posting system.'
  },
  {
    icon: Users,
    title: 'Connect with Friends',
    description: 'Build meaningful connections and stay in touch with the people who matter most.'
  },
  {
    icon: Heart,
    title: 'Engage & Interact',
    description: 'Like, comment, and engage with content from your community in real-time.'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Experience blazing-fast performance with our modern technology stack.'
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data is secure with enterprise-grade security and privacy controls.'
  },
  {
    icon: TrendingUp,
    title: 'Stay Updated',
    description: 'Never miss a moment with real-time updates and personalized timelines.'
  }
]
