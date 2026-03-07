'use client'

import { useEffect, useState, useCallback } from 'react'

const CSRF_COOKIE_NAME = 'buysel_csrf'

// Get CSRF token from cookie
function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === CSRF_COOKIE_NAME) {
      return value
    }
  }
  return null
}

export function useCsrf() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch CSRF token from server
  const fetchCsrfToken = useCallback(async () => {
    try {
      // First check if we have it in cookie
      const cookieToken = getCsrfTokenFromCookie()
      if (cookieToken) {
        setCsrfToken(cookieToken)
        setIsLoading(false)
        return cookieToken
      }

      // Otherwise fetch from server
      const response = await fetch('/api/auth/csrf')
      if (response.ok) {
        const data = await response.json()
        setCsrfToken(data.csrfToken)
        setIsLoading(false)
        return data.csrfToken
      }
    } catch (error) {
      // Silent failure - CSRF will be handled server-side
    }
    setIsLoading(false)
    return null
  }, [])

  useEffect(() => {
    fetchCsrfToken()
  }, [fetchCsrfToken])

  // Wrapper for fetch that automatically adds CSRF header
  const fetchWithCsrf = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    let token = csrfToken || getCsrfTokenFromCookie()

    // If no token, try to fetch one
    if (!token) {
      token = await fetchCsrfToken()
    }

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers['X-CSRF-Token'] = token
    }

    return fetch(url, {
      ...options,
      headers,
    })
  }, [csrfToken, fetchCsrfToken])

  return {
    csrfToken,
    isLoading,
    fetchWithCsrf,
    refreshToken: fetchCsrfToken
  }
}
