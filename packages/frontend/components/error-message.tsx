import { getErrorDetails } from '@/lib/trpc-error'

interface ErrorMessageProps {
  error: unknown
  className?: string
  fallback?: string
  'data-ci'?: string
}

export function ErrorMessage({ error, className = '', fallback, 'data-ci': dataCi }: ErrorMessageProps) {
  if (!error && !fallback) {
    return null
  }

  const details = getErrorDetails(error || fallback)
  const message = error ? details.message : fallback || 'An error occurred'

  return (
    <div className={`text-sm text-destructive ${className}`} role="alert" data-ci={dataCi}>
      <span>{message}</span>
    </div>
  )
}
