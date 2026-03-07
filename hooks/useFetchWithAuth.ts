'use client'

import { useCallback } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { API_BASE_URL } from '@/lib/config'

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
    }

    return fetch(url, {
      ...options,
      headers,
    })
  }, [getToken])

  return { fetchWithAuth }
}
