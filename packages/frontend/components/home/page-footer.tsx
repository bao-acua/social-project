import * as Separator from '@radix-ui/react-separator'

export function PageFooter() {
  return (
    <footer className="mt-16">
      <Separator.Root className="bg-border h-[1px]" />
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-sm text-muted-foreground">
          Built with Next.js, tRPC, and PostgreSQL
        </p>
      </div>
    </footer>
  )
}
