const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/trpc', '')
  const backendUrl = `${getBackendUrl()}/trpc${path}${url.search}`

  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.set('content-type', 'application/json')

  try {
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
    })

    return response
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to connect to backend' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/trpc', '')
  const backendUrl = `${getBackendUrl()}/trpc${path}${url.search}`

  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.set('content-type', 'application/json')

  const body = await request.text()

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: body || undefined,
      cache: 'no-store',
    })

    return response
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to connect to backend' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
