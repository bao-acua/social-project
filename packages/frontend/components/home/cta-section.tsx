import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function CTASection() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <Card className="max-w-4xl mx-auto border-2 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="pt-12 pb-12 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to get started?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of users who are already connecting and sharing their stories. Sign up now and become part of our community.
          </p>
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
        </CardContent>
      </Card>
    </section>
  )
}
