export type TRPCErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_SERVER_ERROR'
  | 'PARSE_ERROR'
  | 'METHOD_NOT_SUPPORTED'
  | 'TIMEOUT'
  | 'TOO_MANY_REQUESTS'
  | 'CLIENT_CLOSED_REQUEST'

export interface TRPCErrorData {
  code: TRPCErrorCode
  httpStatus: number
  message?: string
  stack?: string
}

export interface TRPCErrorShape {
  message: string
  code: TRPCErrorCode
  data: TRPCErrorData
}

export interface TRPCClientError {
  message: string
  data?: TRPCErrorData
  shape?: TRPCErrorShape
  cause?: unknown
}

export function isTRPCError(error: unknown): error is TRPCClientError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as TRPCClientError).message === 'string'
  )
}

export function getTRPCErrorCode(error: unknown): TRPCErrorCode | null {
  if (!isTRPCError(error)) {
    return null
  }

  return error.data?.code || error.shape?.code || 'INTERNAL_SERVER_ERROR'
}

export function getTRPCErrorMessage(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred'
  }

  if (typeof error === 'string') {
    return error
  }

  if (!isTRPCError(error)) {
    if (error instanceof Error) {
      return error.message
    }
    return 'An unknown error occurred'
  }

  const code = getTRPCErrorCode(error)
  const message = error.message || error.data?.message || error.shape?.message

  if (message && !message.includes('ID=')) {
    return message
  }

  return getUserFriendlyErrorMessage(code || 'INTERNAL_SERVER_ERROR')
}

export function getUserFriendlyErrorMessage(code: TRPCErrorCode): string {
  switch (code) {
    case 'BAD_REQUEST':
      return 'Invalid request. Please check your input and try again.'
    case 'UNAUTHORIZED':
      return 'You are not authorized to perform this action. Please log in.'
    case 'FORBIDDEN':
      return 'You do not have permission to access this resource.'
    case 'NOT_FOUND':
      return 'The requested resource was not found.'
    case 'CONFLICT':
      return 'This action conflicts with existing data. Please try again.'
    case 'TIMEOUT':
      return 'The request timed out. Please try again.'
    case 'TOO_MANY_REQUESTS':
      return 'Too many requests. Please wait a moment and try again.'
    case 'PARSE_ERROR':
      return 'There was an error processing the response. Please try again.'
    case 'METHOD_NOT_SUPPORTED':
      return 'This operation is not supported.'
    case 'CLIENT_CLOSED_REQUEST':
      return 'The request was cancelled.'
    case 'INTERNAL_SERVER_ERROR':
    default:
      return 'An unexpected error occurred. Please try again later.'
  }
}

export function getErrorDetails(error: unknown): {
  message: string
  code: TRPCErrorCode | null
  httpStatus: number | null
  isUserError: boolean
} {
  if (!isTRPCError(error)) {
    return {
      message: getTRPCErrorMessage(error),
      code: null,
      httpStatus: null,
      isUserError: false,
    }
  }

  const code = getTRPCErrorCode(error)
  const httpStatus = error.data?.httpStatus || error.shape?.data?.httpStatus || null
  const message = getTRPCErrorMessage(error)

  const isUserError =
    code === 'BAD_REQUEST' ||
    code === 'UNAUTHORIZED' ||
    code === 'FORBIDDEN' ||
    code === 'NOT_FOUND' ||
    code === 'CONFLICT'

  return {
    message,
    code,
    httpStatus,
    isUserError,
  }
}
