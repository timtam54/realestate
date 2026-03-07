import { cookies } from 'next/headers'
import { getSession } from './session'

const CSRF_TOKEN_KEY = 'csrf_token'
const CSRF_COOKIE_NAME = 'buysel_csrf'

// Generate a random CSRF token
export function generateCsrfToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Get or create CSRF token in session
export async function getCsrfToken(): Promise<string> {
  const session = await getSession()

  // Check if session has a CSRF token, if not create one
  if (!session[CSRF_TOKEN_KEY]) {
    session[CSRF_TOKEN_KEY] = generateCsrfToken()
    await session.save()
  }

  return session[CSRF_TOKEN_KEY] as string
}

// Set CSRF token cookie for client access
export async function setCsrfCookie(): Promise<string> {
  const token = await getCsrfToken()
  const cookieStore = await cookies()

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be readable by JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })

  return token
}

// Validate CSRF token from request header against session
export async function validateCsrfToken(request: Request): Promise<boolean> {
  const session = await getSession()
  const sessionToken = session[CSRF_TOKEN_KEY] as string | undefined

  if (!sessionToken) {
    return false
  }

  // Check X-CSRF-Token header
  const headerToken = request.headers.get('X-CSRF-Token')

  if (headerToken && headerToken === sessionToken) {
    return true
  }

  return false
}

// Middleware helper to check CSRF for mutating requests
export async function requireCsrf(request: Request): Promise<{ valid: boolean; error?: string }> {
  const method = request.method.toUpperCase()

  // Only validate for mutating methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return { valid: true }
  }

  // Skip CSRF for certain paths (webhooks, OAuth callbacks)
  const url = new URL(request.url)
  const skipPaths = [
    '/api/auth/google/callback',
    '/api/auth/microsoft/callback',
    '/api/auth/facebook/callback',
    '/api/data-deletion', // Facebook webhook
  ]

  if (skipPaths.some(path => url.pathname.startsWith(path))) {
    return { valid: true }
  }

  const isValid = await validateCsrfToken(request)

  if (!isValid) {
    return { valid: false, error: 'Invalid or missing CSRF token' }
  }

  return { valid: true }
}
