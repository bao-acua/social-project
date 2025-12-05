import { getErrorDetails } from '@/lib/trpc-error'

interface ErrorMessageProps {
  error: unknown
  className?: string
  fallback?: string
}

export function ErrorMessage({ error, className = '', fallback }: ErrorMessageProps) {
  if (!error && !fallback) {
    return null
  }

  const details = getErrorDetails(error || fallback)
  const message = error ? details.message : fallback || 'An error occurred'

  return (
    <div className={`text-sm text-destructive ${className}`} role="alert">
      <span>{message}</span>
    </div>
  )
}
