'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name: string
  image?: string
  provider: 'google' | 'microsoft' | 'facebook'
  role?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (provider: 'google' | 'microsoft' | 'facebook', callbackUrl?: string) => void
  signOut: () => Promise<void>
  getToken: () => Promise<string | null>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()

      if (data.isLoggedIn && data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to fetch session:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSession()
  }, [])

  const signIn = (provider: 'google' | 'microsoft' | 'facebook', callbackUrl = '/') => {
    window.location.href = `/api/auth/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`
  }

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      setUser(null)
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const getToken = async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/auth/token')
      if (!response.ok) return null

      const data = await response.json()
      return data.token
    } catch (error) {
      console.error('Failed to get token:', error)
      return null
    }
  }

  const refreshSession = async () => {
    await fetchSession()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signOut,
        getToken,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
