'use client'

import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/auth/auth-context'

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#4ade80',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
      {children}
    </AuthProvider>
  )
}