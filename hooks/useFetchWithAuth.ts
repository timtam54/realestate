'use client'

import { useCallback } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { API_BASE_URL } from '@/lib/config'

/**
 * Convert external API URL to local proxy URL
 * This avoids CORS/network issues by routing through Next.js server
 */
function toProxyUrl(url: string): string {
  if (url.startsWith(API_BASE_URL)) {
    // Convert https://buysel.azurewebsites.net/api/foo to /api/proxy/foo
    const apiPath = url.replace(`${API_BASE_URL}/api/`, '')
    return `/api/proxy/${apiPath}`
  }
  return url
}

export function useFetchWithAuth() {
  const { getToken } = useAuth()

  const fetchWithAuth = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    let token: string | null = null
    try {
      token = await getToken()
    } catch (tokenError) {
      console.error('Error getting token:', tokenError)
      // Continue without token for public endpoints
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Route external API calls through local proxy
    const proxyUrl = toProxyUrl(url)

    return fetch(proxyUrl, {
      ...options,
      headers,
    })
  }, [getToken])

  return { fetchWithAuth }
}
