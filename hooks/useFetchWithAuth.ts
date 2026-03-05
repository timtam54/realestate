'use client'

import { useCallback } from 'react'
import { useAuth } from '@/lib/auth/auth-context'

export const API_BASE_URL = 'https://buysel.azurewebsites.net'

export function useFetchWithAuth() {
  const { getToken } = useAuth()

  const fetchWithAuth = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const token = await getToken()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    } else {
      console.warn('[fetchWithAuth] No token available for request:', url)
    }

    return fetch(url, {
      ...options,
      headers,
    })
  }, [getToken])

  return { fetchWithAuth }
}
