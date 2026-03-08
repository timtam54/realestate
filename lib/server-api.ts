/**
 * Server-side API utilities for Next.js API routes.
 *
 * Use this module for server-side (API route) calls to the C# backend.
 * For client-side calls, use the useFetchWithAuth hook instead.
 *
 * This module handles:
 * - Reading user session from iron-session cookie
 * - Generating JWT tokens for backend authentication
 * - Adding proper headers for API calls
 */
import { getSession } from '@/lib/auth/session'
import { signJWT } from '@/lib/auth/jwt'
import { API_BASE_URL } from '@/lib/config'

/**
 * Makes an authenticated fetch request to the C# backend from a Next.js API route.
 *
 * Automatically:
 * - Retrieves user session from iron-session cookie
 * - Generates a JWT token with user claims
 * - Adds Authorization header with Bearer token
 * - Sets Content-Type to application/json
 *
 * If no session exists, the request is made without auth headers.
 *
 * @param url - Full API URL (use API_ENDPOINTS from lib/config)
 * @param options - Standard fetch options (method, body, etc.)
 * @returns Promise resolving to fetch Response
 *
 * @example
 * // GET request
 * const res = await serverFetchWithAuth(API_ENDPOINTS.USER_BY_EMAIL(email))
 *
 * // POST request with body
 * const res = await serverFetchWithAuth(API_ENDPOINTS.MESSAGE, {
 *   method: 'POST',
 *   body: JSON.stringify({ content: 'Hello', conversationId: 123 })
 * })
 */
export async function serverFetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const session = await getSession()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  // Add auth token if we have a session
  if (session?.user) {
    const token = await signJWT({
      sub: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      provider: session.user.provider,
    })
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(url, {
    ...options,
    headers,
  })
}
