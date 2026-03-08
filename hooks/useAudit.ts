'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth/auth-context'

interface AuditParams {
  page: string
  action: string
  propertyid?: number
}

interface AuditPayload {
  ipaddress: string
  id: number
  action: string
  page: string
  username: string
  dte: string
  propertyid: number
}

/**
 * Get IP address - server will capture the real IP from request headers
 * Client-side IP lookup removed due to CSP/service worker issues
 */
function getIPAddress(): string {
  return 'client'  // Server will use X-Forwarded-For header
}

/**
 * Get CSRF token from cookie
 */
function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/buysel_csrf=([^;]+)/)
  return match ? match[1] : null
}

/**
 * Hook to track user actions for audit purposes
 * Automatically logs page views and actions to the audit API
 */
export function useAudit() {
  const { user } = useAuth()
  const ipAddressRef = useRef<string | null>(null)
  const csrfTokenRef = useRef<string | null>(null)

  // Set IP placeholder and fetch CSRF token
  useEffect(() => {
    if (!ipAddressRef.current) {
      ipAddressRef.current = getIPAddress()
    }
    // Fetch CSRF token on mount
    const fetchCsrf = async () => {
      try {
        const response = await fetch('/api/auth/csrf')
        if (response.ok) {
          const data = await response.json()
          csrfTokenRef.current = data.csrfToken
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error)
      }
    }
    if (!csrfTokenRef.current) {
      fetchCsrf()
    }
  }, [])

  const logAudit = useCallback(async ({ page, action, propertyid }: AuditParams) => {
    try {
      // Get IP address (use cached if available)
      const ipaddress = ipAddressRef.current || getIPAddress()

      // Cache IP for future calls
      if (!ipAddressRef.current) {
        ipAddressRef.current = ipaddress
      }

      // Get CSRF token from ref or cookie
      const csrfToken = csrfTokenRef.current || getCsrfTokenFromCookie()

      const payload: AuditPayload = {
        ipaddress,
        id: 0,
        action,
        page,
        username: user?.email || 'anonymous',
        dte: new Date().toISOString(),
        propertyid: propertyid || 0
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken
      }

      const response = await fetch('/api/audit', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        console.error('Audit log failed:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error logging audit:', error)
    }
  }, [user?.email])

  return { logAudit }
}

/**
 * Hook to automatically log page views
 * Call this at the top of any page component to track visits
 */
export function usePageView(page: string, propertyid?: number) {
  const { user, isLoading } = useAuth()
  const { logAudit } = useAudit()
  const hasLoggedRef = useRef(false)

  useEffect(() => {
    // Wait for auth to finish loading before logging
    // This ensures we capture the actual user email instead of 'anonymous'
    // when the user is logged in but the session is still loading
    if (!isLoading && !hasLoggedRef.current) {
      logAudit({ page, action: 'view', propertyid })
      hasLoggedRef.current = true
    }
  }, [page, propertyid, logAudit, user, isLoading])

  return { logAudit }
}
