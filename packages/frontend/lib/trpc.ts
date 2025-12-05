import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import type { AppRouter } from './trpc-types'

export const trpc = createTRPCReact<AppRouter>()

export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return ''
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return `http://localhost:${process.env.PORT || '3001'}`
}

export function getEndingLink() {
  const isBrowser = typeof window !== 'undefined'

  let url: string
  if (isBrowser) {
    url = '/api/trpc'
  } else {
    const baseUrl = getBaseUrl()
    url = `${baseUrl}/api/trpc`
  }

  return httpBatchLink({
    url,
    transformer: superjson,
    headers: async () => {
      if (!isBrowser) return {}
      const token = localStorage.getItem('token')
      return token ? { authorization: `Bearer ${token}` } : {}
    },
    maxURLLength: 2000,
    maxItems: process.env.NODE_ENV == 'development' ? 1 : undefined,
  })
}

export { superjson }
