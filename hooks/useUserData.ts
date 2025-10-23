'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
//import { useRouter } from 'next/navigation'

interface UserData {
  id: number
  email: string
  firstname: string
  lastname: string
  idverified: string | null
  dateofbirth?: string | null
  idbloburl?: string
  phone?: string
  address?: string
}

interface UseUserDataReturn {
  userData: UserData | null
  userId: number | null
  isLoading: boolean
  isProfileComplete: boolean
  dateofbirth: string | null
  idbloburl: string | null
  idverified: string | null
  error: string | null
  refetchUserData: () => Promise<void>
  clearUserData: () => void
}

const USER_DATA_KEY = 'buysel_user_data'
const USER_DATA_EXPIRY_KEY = 'buysel_user_data_expiry'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const USER_DATA_INVALIDATION_EVENT = 'buysel_user_data_invalidated'

/**
 * Invalidate the user data cache globally
 * Call this after updating user data to force all components to refetch
 */
export function invalidateUserDataCache() {
  if (typeof window === 'undefined') return

  localStorage.removeItem(USER_DATA_KEY)
  localStorage.removeItem(USER_DATA_EXPIRY_KEY)

  // Dispatch custom event to notify all useUserData hooks
  window.dispatchEvent(new CustomEvent(USER_DATA_INVALIDATION_EVENT))

  console.log('User data cache invalidated globally')
}

export function useUserData(): UseUserDataReturn {
  const { data: session, status } = useSession()
  //const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated' || !session?.user?.email) {
      clearUserData()
      setIsLoading(false)
      return
    }

    // Check localStorage first
    const cachedData = localStorage.getItem(USER_DATA_KEY)
    const cachedExpiry = localStorage.getItem(USER_DATA_EXPIRY_KEY)
    
    if (cachedData && cachedExpiry) {
      const expiry = parseInt(cachedExpiry)
      const now = Date.now()
      
      if (now < expiry) {
        try {
          const parsedData = JSON.parse(cachedData)
          // Verify the cached data is for the current user
          if (parsedData.email === session.user.email) {
            console.log('Using cached user data for:', parsedData.email)
            setUserData(parsedData)
            setIsLoading(false)
            return
          }
        } catch (e) {
          console.error('Error parsing cached user data:', e)
        }
      }
    }

    // If no valid cache, fetch from API
    fetchUserData()
  }, [session?.user?.email, status])

  const fetchUserData = useCallback(async () => {
    if (!session?.user?.email) {
      setError('No user email found')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Fetching user data for:', session.user.email)
      const response = await fetch(`https://buysel.azurewebsites.net/api/user/email/${encodeURIComponent(session.user.email)}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          // User profile doesn't exist
          console.log('User profile not found, needs to be created')
          setUserData(null)
          setIsLoading(false)
          return
        }
        throw new Error(`Failed to fetch user data: ${response.status}`)
      }

      const data = await response.json()
      
      // Store in localStorage with expiry
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(data))
      localStorage.setItem(USER_DATA_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString())
      
      console.log('User data fetched and cached:', data)
      setUserData(data)
    } catch (err) {
      console.error('Error fetching user data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch user data')
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.email])

  const refetchUserData = useCallback(async () => {
    // Clear cache and refetch
    localStorage.removeItem(USER_DATA_KEY)
    localStorage.removeItem(USER_DATA_EXPIRY_KEY)
    await fetchUserData()
  }, [fetchUserData])

  const clearUserData = useCallback(() => {
    localStorage.removeItem(USER_DATA_KEY)
    localStorage.removeItem(USER_DATA_EXPIRY_KEY)
    setUserData(null)
    setError(null)
  }, [])

  // Listen for cache invalidation events
  useEffect(() => {
    const handleInvalidation = () => {
      console.log('Cache invalidation event received, refetching user data')
      fetchUserData()
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === USER_DATA_KEY && !e.newValue) {
        // Cache was cleared, reset state
        setUserData(null)
      }
    }

    window.addEventListener(USER_DATA_INVALIDATION_EVENT, handleInvalidation)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener(USER_DATA_INVALIDATION_EVENT, handleInvalidation)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [fetchUserData])

  const isProfileComplete = userData ? 
    !!(userData.firstname && userData.lastname) : 
    false

  return {
    userData,
    userId: userData?.id || null,
    isLoading,
    isProfileComplete,
    dateofbirth: userData?.dateofbirth || null,
    idbloburl: userData?.idbloburl || null,
    idverified: userData?.idverified || null,
    error,
    refetchUserData,
    clearUserData
  }
}