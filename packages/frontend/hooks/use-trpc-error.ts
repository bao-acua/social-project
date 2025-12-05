import { useState, useCallback } from 'react'
import { getTRPCErrorMessage, getErrorDetails, type TRPCErrorCode } from '@/lib/trpc-error'

export function useTRPCError() {
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<TRPCErrorCode | null>(null)
  const [isUserError, setIsUserError] = useState(false)

  const handleError = useCallback((err: unknown) => {
    const details = getErrorDetails(err)
    setError(details.message)
    setErrorCode(details.code)
    setIsUserError(details.isUserError)

    if (process.env.NODE_ENV === 'development') {
      console.error('tRPC Error:', {
        message: details.message,
        code: details.code,
        httpStatus: details.httpStatus,
        originalError: err,
      })
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
    setErrorCode(null)
    setIsUserError(false)
  }, [])

  return {
    error,
    errorCode,
    isUserError,
    handleError,
    clearError,
  }
}
