'use client'

import Login from '@/components/Login'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  useEffect(() => {
    // Store the callback URL in sessionStorage as a workaround for providers that don't preserve it
    if (callbackUrl && callbackUrl !== '/') {
      sessionStorage.setItem('auth_callback_url', callbackUrl)
    }
  }, [callbackUrl])

  const handleClose = () => {
    router.push('/')
  }

  return <Login onClose={handleClose} callbackUrl={callbackUrl} />
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  )
}
