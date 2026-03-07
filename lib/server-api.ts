// Server-side API utility for authenticated fetch calls to the C# backend
import { getSession } from '@/lib/auth/session'
import { signJWT } from '@/lib/auth/jwt'
import { API_BASE_URL } from '@/lib/config'

/**
 * Server-side authenticated fetch for API routes
 * Gets the session and creates a JWT token for the backend
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
