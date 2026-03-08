import { NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/config'

/**
 * Proxy all requests to the C# backend API
 * This avoids CORS issues and network restrictions
 */
async function handleRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const apiPath = path.join('/')
  const url = new URL(request.url)
  const queryString = url.search

  const targetUrl = `${API_BASE_URL}/api/${apiPath}${queryString}`

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Forward authorization header if present
    const authHeader = request.headers.get('Authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    }

    // Forward body for non-GET requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const body = await request.text()
      if (body) {
        fetchOptions.body = body
      }
    }

    const response = await fetch(targetUrl, fetchOptions)

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const data = await response.json()
      return NextResponse.json(data, { status: response.status })
    } else {
      const text = await response.text()
      return new NextResponse(text, {
        status: response.status,
        headers: { 'Content-Type': contentType || 'text/plain' }
      })
    }
  } catch (error) {
    console.error(`Proxy error for ${targetUrl}:`, error)
    return NextResponse.json(
      { error: 'Backend API request failed' },
      { status: 502 }
    )
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context)
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context)
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context)
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context)
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context)
}
